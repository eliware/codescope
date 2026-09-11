import { combineFileSections } from '../../src/combine/file-sections.mjs';

test('combines supplied file sections', async () => {
  await expect(
    combineFileSections('repo', ['a.mjs'], {
      maxChars: Infinity,
      concurrency: 1,
      batchSize: 1,
      readFileContents: async () => 'export {};',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      validateSymlinks: false,
    }),
  ).resolves.toContain('a.mjs');
});
