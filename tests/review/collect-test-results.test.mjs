import { collectTestResults } from '../../src/review/collect-test-results.mjs';

test('collects and formats a passing npm test result', async () => {
  await expect(
    collectTestResults(
      'C:/repo',
      1000,
      async () => ({ stdout: 'ok', stderr: '', code: 0 }),
      (value) => value.toUpperCase(),
      'linux',
      {},
    ),
  ).resolves.toContain('status: pass');
});

test('does not treat an injected executor without a status as passing', async () => {
  await expect(
    collectTestResults(
      'C:/repo',
      1000,
      async () => ({ stdout: 'incomplete', stderr: '' }),
      (value) => value,
      'linux',
      {},
    ),
  ).resolves.toMatch(/status: unknown[\s\S]*exit code: unknown/);
});
