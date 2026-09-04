import { combineSelectedFiles } from '../../src/combine/selected.mjs';

test('combines selected implementation, tests, results, and docs in order', async () => {
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
    testResults: 'RESULTS',
  });
  expect(result).toContain('RESULTS');
});

test('returns package metadata when no optional sections are selected', async () => {
  await expect(
    combineSelectedFiles('/repo', { readFileContents: async () => '{"name":"x"}' }),
  ).resolves.toContain('package.json');
});
