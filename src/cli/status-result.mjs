import { EXIT_CODES } from './errors.mjs';

export function statusForPromptResult(_result) {
  return EXIT_CODES.PASS;
}

export function statusForReviewResult(_result, { isSuggestion: _isSuggestion }) {
  return EXIT_CODES.PASS;
}
