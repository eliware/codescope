import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { combineFiles, combineMdFiles, combineMjsFiles } from '../src/combine-mjs.mjs';

const oneFile = (name = 'a.mjs') => ({
  readDirectory: async () => [{ name, isFile: () => true }],
});

test('combines, trims, numbers, and batches source files', async () => {
  const files = { '/root/a.mjs': 'one\ntwo\n', '/root/b.mjs': '' };
  const result = await combineMjsFiles('/root', {
    ...oneFile(),
    readDirectory: async () => [
      { name: 'b.mjs', isFile: () => true },
      { name: 'a.mjs', isFile: () => true },
    ],
    concurrency: 2,
    readFileContents: async (file) =>
      files[file.replaceAll('\\', '/').replace(/^.*(?=\/root\/)/u, '')],
  });
  expect(result).toBe('===== a.mjs =====\n1 one\n2 two\n\n===== b.mjs =====\n1 [empty file]\n');
});

test('uses one-file batches for finite limits and enforces aggregate limits', async () => {
  const calls = [];
  await expect(
    combineMjsFiles('/root', {
      readDirectory: async () => [
        { name: 'a.mjs', isFile: () => true },
        { name: 'b.mjs', isFile: () => true },
      ],
      maxChars: 1000,
      readFileContents: async (file) => {
        calls.push(file);
        return 'x';
      },
    }),
  ).resolves.toContain('===== b.mjs =====');
  expect(calls).toHaveLength(2);
  await expect(
    combineMjsFiles('/root', { ...oneFile(), maxChars: 20, readFileContents: async () => 'long' }),
  ).rejects.toThrow('Combined source exceeds');
  await expect(
    combineMjsFiles('/root', { ...oneFile(), maxChars: 1, readFileContents: async () => 'xx' }),
  ).rejects.toThrow('Combined source exceeds');
});

test('validates options and rejects unsafe roots', async () => {
  if (process.platform !== 'win32')
    await expect(
      combineFiles('C:\\root', '.mjs', { readDirectory: async () => [] }),
    ).rejects.toThrow('Windows-style');
  for (const concurrency of [0, 1.5, '1'])
    await expect(
      combineMjsFiles('/root', { concurrency, readDirectory: async () => [] }),
    ).rejects.toThrow('concurrency');
  for (const maxChars of [0, -1, 1.5, '1', Number.NaN])
    await expect(
      combineMjsFiles('/root', { maxChars, readDirectory: async () => [] }),
    ).rejects.toThrow('maxChars');
});

test('validates real files and wraps all read failures', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-combine-'));
  await mkdir(path.join(root, 'nested'));
  await mkdir(path.join(root, 'directory.mjs'));
  await writeFile(path.join(root, 'a.mjs'), 'actual\n');
  await writeFile(path.join(root, 'nested', 'b.mjs'), 'nested');
  await expect(combineMjsFiles(root, { readDirectory: undefined })).resolves.toContain('actual');
  await expect(
    combineMjsFiles(root, {
      readDirectory: async () => [{ name: 'a.mjs', isFile: () => true }],
      validateSymlinks: true,
      readFileContents: async () => 'checked',
    }),
  ).resolves.toContain('checked');
  await expect(
    combineMjsFiles(root, {
      readDirectory: async () => [{ name: 'directory.mjs', isFile: () => true }],
      validateSymlinks: true,
      readFileContents: async () => 'unreachable',
    }),
  ).rejects.toThrow('regular file');
  if (process.platform !== 'win32') {
    const { symlink } = await import('node:fs/promises');
    await symlink(path.join(root, 'a.mjs'), path.join(root, 'alias.mjs'));
    await expect(
      combineMjsFiles(root, {
        readDirectory: async () => [{ name: 'alias.mjs', isFile: () => true }],
        validateSymlinks: true,
        readFileContents: async () => 'unreachable',
      }),
    ).rejects.toThrow('symlinked');
  }
  expect(
    await combineMdFiles('/root', {
      readDirectory: async () => [],
      readFileContents: async () => '',
    }),
  ).toBe('');
  await expect(
    combineMjsFiles('/root', {
      ...oneFile(),
      readFileContents: async () => {
        throw 'denied';
      },
    }),
  ).rejects.toThrow('denied');
  await expect(
    combineMjsFiles('/root', { ...oneFile(), readFileContents: async () => null }),
  ).rejects.toThrow('non-string');
});
