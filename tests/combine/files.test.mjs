import { combineFiles } from '../../src/combine/files.mjs';
import { combineMdFiles, combineMjsFiles, combineCodeFiles } from '../../src/combine/source-file-aliases.mjs';

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

test('combineCodeFiles delegates to the supported implementation extensions', async () => {
  await expect(
    combineCodeFiles('/root', {
      readDirectory: async () => [],
      readFileContents: async () => '',
    }),
  ).resolves.toBe('');
});

test('filters supplied files by extension and supports Markdown wrappers', async () => {
  await expect(combineMjsFiles('/root', {
    files: ['a.mjs', 'guide.md'],
    readFileContents: async () => 'code',
  })).resolves.toContain('===== a.mjs =====');
  await expect(combineFiles('/root', '.mjs', {
    files: ['a.mjs', 'guide.md'],
    readFileContents: async () => 'code',
  })).resolves.not.toContain('guide.md');
  await expect(combineMdFiles('/root', {
    files: ['guide.md'],
    readFileContents: async () => 'docs',
  })).resolves.toContain('===== guide.md =====');
});

test('combines files with default options', async () => {
  await expect(
    combineFiles('/root', '.mjs', {
      readDirectory: async () => [],
      readFileContents: async () => '',
    }),
  ).resolves.toBe('');
  await expect(combineFiles(process.cwd(), '.not-a-real-extension')).resolves.toBe('');
});
