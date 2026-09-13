import { collectAllSections } from '../../src/combine/all-sections.mjs';

test('collects all ordered section inputs through injected collaborators', async () => {
  const result = await collectAllSections('repo', {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
  });
  expect(result).toHaveProperty('packageJson');
  expect(result.other).toContain('other files');
});

test('collects sections with default options', async () => {
  await expect(collectAllSections(process.cwd())).resolves.toHaveProperty('packageJson');
});
