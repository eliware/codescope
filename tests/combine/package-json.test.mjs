import { combinePackageJson } from '../../src/combine/package-json.mjs';

test('combines package metadata with a numbered section', async () => {
  await expect(
    combinePackageJson('/repo', {
      readFileContents: async () => '{"name":"fixture"}\n',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
    }),
  ).resolves.toContain('===== package.json =====\n1 {"name":"fixture"}');
});

test('reads repository package metadata with default options', async () => {
  await expect(combinePackageJson(process.cwd())).resolves.toContain('package.json');
});
