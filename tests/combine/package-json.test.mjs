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

test('inspects package metadata before using a custom reader', async () => {
  await expect(
    combinePackageJson('/virtual', {
      readFileContents: async () => '{"name":"virtual"}',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toContain('virtual');
});

test('formats non-Error package reader failures', async () => {
  await expect(combinePackageJson('/virtual', {
    readFileContents: async () => { throw 'package unavailable'; },
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).rejects.toThrow('Unable to read package.json: package unavailable');
});

test('rewrites symlink package errors with package-specific guidance', async () => {
  await expect(combinePackageJson('/virtual', {
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => true, isFile: () => false }),
  })).rejects.toThrow(/symlinked package\.json/);
});

test('supports explicit POSIX package paths', async () => {
  await expect(combinePackageJson('/virtual', {
    platform: 'linux',
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).resolves.toContain('package.json');
});

test('supports explicit Windows package paths', async () => {
  await expect(combinePackageJson('C:\\virtual', {
    platform: 'win32',
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).resolves.toContain('package.json');
});

test('preserves Error package reader messages', async () => {
  await expect(combinePackageJson('/virtual', {
    readFileContents: async () => { throw new Error('reader failed'); },
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).rejects.toThrow('Unable to read package.json: reader failed');
});
