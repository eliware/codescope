import { describeOtherFiles } from '../../src/combine/other-files.mjs';

const regular = async () => ({ isSymbolicLink: () => false, isFile: () => true });

test('composes metadata for unsupplied inventory files in sorted order', async () => {
  const result = await describeOtherFiles('repo', ['b.txt', 'a.txt', 'src/app.mjs'], {
    inspectFile: regular,
    readOtherFileContents: async (file) => ({
      data: file.endsWith('a.txt') ? 'a' : 'b', truncated: false,
    }),
  });
  expect(result).toEqual(['a.txt | text | 1 lines | 1 bytes', 'b.txt | text | 1 lines | 1 bytes']);
});

test('preserves independent per-file limits and bounded concurrency', async () => {
  let active = 0;
  let maximum = 0;
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    inspectFile: regular,
    concurrency: 2,
    readOtherFileContents: async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return { data: Buffer.alloc(100_001, 'x'), truncated: true };
    },
  });
  expect(maximum).toBe(2);
  expect(result).toHaveLength(2);
});

test('rejects invalid concurrency and paths outside the review root', async () => {
  await expect(describeOtherFiles('repo', ['notes.txt'], { concurrency: 0 }))
    .rejects.toThrow(/concurrency/);
  await expect(describeOtherFiles('repo', ['../outside.txt'], {
    inspectFile: regular,
    readOtherFileContents: async () => ({ data: 'outside', truncated: false }),
  })).rejects.toThrow(/escapes review root/);
});

test('supports explicit platform semantics for inventory roots', async () => {
  await expect(describeOtherFiles('C:\\repo', ['notes.txt'], {
    platform: 'win32', inspectFile: regular,
    readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
  })).resolves.toEqual(['notes.txt | text | 1 lines | 5 bytes']);
});

test('uses the default bounded reader on the current platform', async () => {
  await expect(describeOtherFiles(process.cwd(), ['LICENSE']))
    .resolves.toEqual(expect.arrayContaining([expect.stringContaining('LICENSE | text')]));
});

test('supports explicit POSIX path selection with an injected reader', async () => {
  await expect(describeOtherFiles('repo', ['notes.txt'], {
    platform: 'linux', inspectFile: regular,
    readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
  })).resolves.toEqual(['notes.txt | text | 1 lines | 5 bytes']);
});
