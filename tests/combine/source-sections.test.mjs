import { collectSourceSections } from '../../src/combine/source-sections.mjs';

test('collects source sections', async () => {
  const result = await collectSourceSections('repo', {
    readDirectory: async () => [],
    readFileContents: async () => '',
  });
  expect(result).toHaveProperty('implementation');
  expect(result).toHaveProperty('tests');
});
