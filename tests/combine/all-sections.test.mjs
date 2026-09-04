import { collectAllSections } from '../../src/combine/all-sections.mjs';

test('collects all ordered section inputs through injected collaborators', async () => {
  const result = await collectAllSections('repo', {
    testResults: 'tests',
    readDirectory: async () => [],
    readFileContents: async () => '{}',
  });
  expect(result).toHaveProperty('packageJson');
  expect(result.testResults).toBe('tests');
  expect(result.other).toContain('other files');
});
