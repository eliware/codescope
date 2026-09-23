import { combineFiles } from '../../src/combine/files.mjs';

const oneFile = (name = 'a.mjs') => ({
  readDirectory: async () => [{ name, isFile: () => true }],
});

test('combines, trims, numbers, and batches source files', async () => {
  const files = { '/root/a.mjs': 'one\ntwo\n', '/root/b.mjs': '' };
  const result = await combineFiles('/root', '.mjs', {
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
    combineFiles('/root', '.mjs', {
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
    combineFiles('/root', '.mjs', { ...oneFile(), maxChars: 20, readFileContents: async () => 'long' }),
  ).rejects.toThrow('Combined source exceeds');
  await expect(
    combineFiles('/root', '.mjs', { ...oneFile(), maxChars: 1, readFileContents: async () => 'xx' }),
  ).rejects.toThrow('Combined source exceeds');
});

test('combineFiles supports the implementation extensions', async () => {
  await expect(
    combineFiles('/root', ['.js', '.mjs', '.cjs', '.ts'], {
      readDirectory: async () => [],
      readFileContents: async () => '',
    }),
  ).resolves.toBe('');
});

test('filters supplied files by extension and supports Markdown wrappers', async () => {
  await expect(combineFiles('/root', '.mjs', {
    files: ['a.mjs', 'guide.md'],
    readFileContents: async () => 'code',
  })).resolves.toContain('===== a.mjs =====');
  await expect(combineFiles('/root', '.mjs', {
    files: ['a.mjs', 'guide.md'],
    readFileContents: async () => 'code',
  })).resolves.not.toContain('guide.md');
  await expect(combineFiles('/root', '.md', {
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
