import { collectAllSections } from '../../src/combine/all-sections.mjs';


test('collects all ordered section inputs through injected collaborators', async () => {
  const result = await collectAllSections('repo', {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toHaveProperty('packageJson');
  expect(result.other).toContain('other files');
});

test('uses the default composition options at the orchestration boundary', async () => {
  const result = await collectAllSections(process.cwd());
  expect(Object.keys(result)).toEqual(expect.arrayContaining(['packageJson', 'other']));
});
