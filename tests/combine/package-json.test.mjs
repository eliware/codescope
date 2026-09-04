import { combinePackageJson } from '../../src/combine/package-json.mjs';

test('combines package metadata with a numbered section', async () => {
  await expect(
    combinePackageJson('/repo', {
      readFileContents: async () => '{"name":"fixture"}\n',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
    }),
  ).resolves.toContain('===== package.json =====\n1 {"name":"fixture"}');
});
