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
