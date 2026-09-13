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

test('omits files after the aggregate metadata budget', async () => {
  const result = await describeOtherFiles(
    'repo',
    Array.from({ length: 32 }, (_, index) => `large-${index}.txt`),
    {
      readFileContents: async () => Buffer.alloc(1_500_000, 'x'),
    },
  );
  expect(result.some((entry) => entry.includes('omitted'))).toBe(true);
});

test('checks known sizes before reading files', async () => {
  const reads = [];
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    statFile: async (file) => ({ size: file.endsWith('first.txt') ? 1_500_000 : 1_500_000 }),
    readFileContents: async (file) => {
      reads.push(file);
      return file.endsWith('first.txt') ? Buffer.alloc(1_500_000, 'x') : 'x';
    },
  });
  expect(result).toContain(
    'second.txt | omitted | 1500000 bytes | aggregate metadata budget exceeded',
  );
  expect(reads).toHaveLength(1);
});

test('omits a file that grows beyond the reserved metadata budget', async () => {
  const result = await describeOtherFiles('repo', ['growing.txt'], {
    statFile: async () => ({ size: 1_000_000 }),
    readFileContents: async () => Buffer.alloc(2_100_000, 'x'),
  });
  expect(result).toEqual([
    'growing.txt | omitted | 2100000 bytes | aggregate metadata budget exceeded',
  ]);
});

test('releases reserved bytes when a file shrinks after stat', async () => {
  const result = await describeOtherFiles('repo', ['shrinking.txt', 'later.txt'], {
    statFile: async (file) => ({ size: file.endsWith('shrinking.txt') ? 1_500_000 : 600_000 }),
    readFileContents: async (file) => (file.endsWith('shrinking.txt') ? 'small' : 'later'),
  });
  expect(result).toEqual([
    'later.txt | text | 1 lines | 5 bytes',
    'shrinking.txt | text | 1 lines | 5 bytes',
  ]);
});
