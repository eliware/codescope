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
