import { collectTestResults, redactTestOutput } from '../../src/review/test-results.mjs';

test('redacts common credentials', () => {
  expect(redactTestOutput('TOKEN=secret sk-test-value')).not.toContain('secret');
});

test('formats successful and timed-out test results', async () => {
  await expect(collectTestResults('repo', 100, async () => ({ stdout: 'ok', stderr: '', code: 0 }))).resolves.toContain('exit code: 0');
  await expect(collectTestResults('repo', 100, async () => { throw { killed: true, stdout: '', stderr: '' }; })).resolves.toContain('timed out');
});
