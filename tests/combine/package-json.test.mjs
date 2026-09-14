import { combinePackageJson } from '../../src/combine/package-json.mjs';

test('combines package metadata with a numbered section', async () => {
  await expect(
    combinePackageJson('/repo', {
      readFileContents: async () => '{"name":"fixture"}\n',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toContain('===== package.json =====\n1 {"name":"fixture"}');
});

test('reads repository package metadata with default options', async () => {
  await expect(combinePackageJson(process.cwd())).resolves.toContain('package.json');
});

test('rejects a package path that is not a regular file', async () => {
  await expect(
    combinePackageJson('/repo', {
      readFileContents: async () => '{}',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
      validateSymlinks: true,
    }),
  ).rejects.toThrow(/regular file/);
});
