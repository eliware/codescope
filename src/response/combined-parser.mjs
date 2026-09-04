import { getFunctionCalls } from './calls.mjs';
import { parseReviewToolResponse } from './review-parser.mjs';
import { parseSuggestionToolResponse } from './suggestion-parser.mjs';

export function parseCombinedToolResponse(response, reviewCategories, suggestionCategories) {
  if (
    getFunctionCalls(response, 'submit_review').length !== 1 ||
    getFunctionCalls(response, 'submit_suggestions').length !== 1
  ) {
    const error = new Error(
      'OpenAI response did not contain exactly one review and suggestion tool call',
    );
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
  const review = parseReviewToolResponse(response, reviewCategories);
  const suggestions = parseSuggestionToolResponse(response, suggestionCategories);
  return { issues: review.issues, suggestions: suggestions.suggestions, verdict: review.verdict };
}
