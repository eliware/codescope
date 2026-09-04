import { EXIT_CODES } from './errors.mjs';

export function statusForPromptResult(result) {
  return typeof result?.text === 'string' ? EXIT_CODES.PASS : EXIT_CODES.RESPONSE;
}

export function statusForReviewResult(result, { isSuggestion, isValid }) {
  if (!isValid) return EXIT_CODES.RESPONSE;
  if (isSuggestion) return EXIT_CODES.PASS;
  return result.verdict === 'block' ? EXIT_CODES.BLOCKED : EXIT_CODES.PASS;
}
