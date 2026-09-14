import { combineSelectedFiles } from '../../src/combine/selected.mjs';

test('combines selected implementation, tests, and docs in order', async () => {
  const options = {
    readDirectory: async () => [],
    readFileContents: async () => '',
    combinePackageJson: undefined,
  };
  const result = await combineSelectedFiles('/repo', {
    ...options,
    implementation: true,
    tests: true,
    docs: true,
  });
  expect(result).toContain('package.json');
  expect(result).toContain('===== other files (names and sizes only) =====');
});

test('returns package metadata when no optional sections are selected', async () => {
  await expect(
    combineSelectedFiles('/repo', {
      readDirectory: async () => [],
      readFileContents: async () => '{"name":"x"}',
    }),
  ).resolves.toContain('package.json');
});

test('uses default options for selected package metadata', async () => {
  await expect(combineSelectedFiles(process.cwd())).resolves.toContain('package.json');
});

test('passes the remaining aggregate budget into selected source reads', async () => {
  await expect(combineSelectedFiles('/repo', {
    implementation: true,
    inventory: ['src/app.mjs'],
    maxChars: 200,
    readDirectory: async () => [],
    readFileContents: async (file) => file.endsWith('package.json') ? '{"name":"x"}' : 'source',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  })).resolves.toContain('source');
});
