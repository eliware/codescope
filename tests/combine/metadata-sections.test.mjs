import { collectMetadataSections } from '../../src/combine/metadata-sections.mjs';

test('collects metadata sections', async () => {
  const result = await collectMetadataSections(
    'repo',
    { readDirectory: async () => [], readFileContents: async () => '{}' },
    [],
  );
  expect(result).toHaveProperty('packageJson');
  expect(result).toHaveProperty('configs');
});
