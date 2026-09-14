import { collectMetadataSections } from '../../src/combine/metadata-sections.mjs';

test('collects metadata sections', async () => {
  const result = await collectMetadataSections(
    'repo',
    {
      readDirectory: async () => [],
      readFileContents: async () => '{}',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    },
    [],
  );
  expect(result).toHaveProperty('packageJson');
  expect(result).toHaveProperty('configs');
});
