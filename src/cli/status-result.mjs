import { EXIT_CODES } from './errors.mjs';

export function statusForPromptResult(_result) {
  return EXIT_CODES.PASS;
}

export function statusForReviewResult(result, { isSuggestion, isValid }) {
  if (!isValid) return EXIT_CODES.RESPONSE;
  if (isSuggestion) return EXIT_CODES.PASS;
  return result.verdict === 'pass' ? EXIT_CODES.PASS : EXIT_CODES.BLOCKED;
}
