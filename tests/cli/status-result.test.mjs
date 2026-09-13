import { statusForPromptResult, statusForReviewResult } from '../../src/cli/status-result.mjs';
import { EXIT_CODES } from '../../src/cli/errors.mjs';

test('maps prompt and review statuses', () => {
  expect(statusForPromptResult({ verdict: 'pass' })).toBe(EXIT_CODES.PASS);
  expect(statusForPromptResult({})).toBe(EXIT_CODES.PASS);
  expect(statusForPromptResult({ raw_response: 'arbitrary JSON' })).toBe(EXIT_CODES.BLOCKED);
  expect(statusForPromptResult({ verdict: 'unknown' })).toBe(EXIT_CODES.PASS);
  expect(statusForPromptResult({ verdict: 1 })).toBe(EXIT_CODES.PASS);
  expect(statusForPromptResult({ verdict: 'block' })).toBe(EXIT_CODES.BLOCKED);
  expect(statusForReviewResult({}, { isSuggestion: true })).toBe(EXIT_CODES.PASS);
  expect(statusForReviewResult({ verdict: 'pass' }, { isSuggestion: false })).toBe(EXIT_CODES.PASS);
  expect(statusForReviewResult({ verdict: 'block' }, { isSuggestion: false })).toBe(
    EXIT_CODES.BLOCKED,
  );
});
