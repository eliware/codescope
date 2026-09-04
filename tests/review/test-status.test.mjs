import { testEvidenceBlocks } from '../../src/review/test-status.mjs';

test('blocks failed and timed-out test evidence', () => {
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 1\nfailed')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\ntimed out after 30 seconds\npartial')).toBe(
    true,
  );
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 0\npassed')).toBe(false);
  expect(testEvidenceBlocks('===== npm test =====\nFAIL tests/app.test.mjs')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\nnpm ERR! code ELIFECYCLE')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\nError: assertion failed')).toBe(true);
});

test('ignores absent or unrelated evidence', () => {
  expect(testEvidenceBlocks()).toBe(false);
  expect(testEvidenceBlocks('npm test output without marker')).toBe(false);
  expect(testEvidenceBlocks('===== npm test =====\nexit code: unknown')).toBe(true);
});
