import { EXIT_CODES } from './errors.mjs';

export function statusForPromptResult(result) {
  if (result === undefined || result === null || result.raw_response || result.verdict === 'block')
    return EXIT_CODES.BLOCKED;
  return EXIT_CODES.PASS;
}

export function statusForReviewResult(result, { isSuggestion }) {
  if (isSuggestion) return EXIT_CODES.PASS;
  return result.verdict === 'pass' ? EXIT_CODES.PASS : EXIT_CODES.BLOCKED;
}
