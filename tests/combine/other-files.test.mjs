import { describeOtherFiles } from '../../src/combine/other-files.mjs';

test('describes unsupplied text and binary files while excluding supplied content', async () => {
  const files = new Map([
    ['notes.txt', 'a\nb'],
    ['image.dat', Buffer.from([0, 1, 2])],
    ['src/app.mjs', 'code'],
    ['README.md', 'docs'],
  ]);
  const result = await describeOtherFiles('repo', [...files.keys()], {
    readFileContents: async (file) => files.get(file.split(/[\\/]/u).at(-1)),
  });
  expect(result).toEqual(['image.dat | binary | 3 bytes', 'notes.txt | text | 2 lines | 3 bytes']);
});

test('returns no entries when all files are supplied elsewhere', async () => {
  await expect(
    describeOtherFiles('repo', ['package.json', 'README.md', '.github/ci.yml', 'src/app.mjs']),
  ).resolves.toEqual([]);
});

test('applies the metadata limit independently to each file', async () => {
  const result = await describeOtherFiles(
    'repo',
    ['large-one.txt', 'large-two.txt'],
    {
      readFileContents: async () => Buffer.alloc(100_001, 'x'),
    },
  );
  expect(result).toEqual([
    'large-one.txt | omitted | 100001 bytes | per-file metadata limit exceeded',
    'large-two.txt | omitted | 100001 bytes | per-file metadata limit exceeded',
  ]);
});

test('checks actual bytes after reading files', async () => {
  const reads = [];
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    readFileContents: async (file) => {
      reads.push(file);
      return file.endsWith('first.txt') ? Buffer.alloc(100_001, 'x') : 'x';
    },
  });
  expect(result).toContain(
    'first.txt | omitted | 100001 bytes | per-file metadata limit exceeded',
  );
  expect(result).toContain('second.txt | text | 1 lines | 1 bytes');
  expect(reads).toHaveLength(2);
});

test('omits a file that grows beyond the per-file metadata limit', async () => {
  const result = await describeOtherFiles('repo', ['growing.txt', 'later.txt'], {
    readFileContents: async (file) =>
      file.endsWith('growing.txt') ? Buffer.alloc(100_001, 'x') : 'later',
  });
  expect(result).toContain('growing.txt | omitted | 100001 bytes | per-file metadata limit exceeded');
  expect(result).toContain('later.txt | text | 1 lines | 5 bytes');
});

test('allows multiple files when each is within the per-file limit', async () => {
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    readFileContents: async (file) => (file.endsWith('first.txt') ? 'first' : 'second'),
  });
  expect(result).toEqual([
    'first.txt | text | 1 lines | 5 bytes',
    'second.txt | text | 1 lines | 6 bytes',
  ]);
});
