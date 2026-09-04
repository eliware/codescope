import {
  collectTestResults,
  redactTestOutput,
  testEvidenceBlocks,
} from '../../src/review/test-results.mjs';

test('identifies failed and timed-out test evidence', () => {
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 1')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\ntimed out after 30 seconds')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 0')).toBe(false);
});

test('redacts common credentials', () => {
  expect(redactTestOutput('TOKEN=secret sk-test-value')).not.toContain('secret');
});

test('formats successful and timed-out test results', async () => {
  await expect(
    collectTestResults('repo', 100, async () => ({ stdout: 'ok', stderr: '', code: 0 })),
  ).resolves.toContain('exit code: 0');
  await expect(
    collectTestResults('repo', 100, async () => {
      throw { killed: true, stdout: '', stderr: '' };
    }),
  ).resolves.toContain('timed out');
});
