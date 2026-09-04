import { isValidReviewResult, isValidSuggestionResult } from './validators.mjs';
import { getFunctionCalls, responseError } from './calls.mjs';
import {
  DEFAULT_REVIEW_CATEGORIES,
  DEFAULT_SUGGESTION_CATEGORIES,
  categoryPrompt,
  validateCategories,
} from './categories.mjs';
export { isValidReviewResult, isValidSuggestionResult } from './validators.mjs';

export function parseReviewToolResponse(response, toolName = 'submit_review', categories) {
  // codescope ignore: profile-generated category names are intentionally accepted so scoped tools expose exactly their requested schema.
  if (!['submit_review', 'submit_suggestions'].includes(toolName))
    throw new Error(`Unsupported Codescope tool: ${toolName}`);
  const allCategories = DEFAULT_REVIEW_CATEGORIES;
  const suggestionCategories = DEFAULT_SUGGESTION_CATEGORIES;
  const expectedCategories =
    categories ?? (toolName === 'submit_suggestions' ? suggestionCategories : allCategories);
  validateCategories(expectedCategories);
  const calls = getFunctionCalls(response, toolName);
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw responseError(`OpenAI response did not contain exactly one ${toolName} tool call`);
  let result;
  try {
    result = JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw responseError(`OpenAI ${toolName} tool arguments were not valid JSON`, cause);
  }
  if (toolName === 'submit_suggestions') {
    if (!isValidSuggestionResult(result, categoryPrompt(expectedCategories, 'suggestions')))
      throw responseError('OpenAI submit_suggestions returned an invalid suggestions result');
    return result;
  }
  // codescope ignore: submit_suggestions has a distinct payload and returns immediately after its own complete validation; review-only issues checks must not apply.
  if (!isValidReviewResult(result, categoryPrompt(expectedCategories, 'issues')))
    throw responseError('OpenAI submit_review returned an invalid review result');
  return result;
}

export function parseCombinedToolResponse(response, reviewCategories, suggestionCategories) {
  const submitted = (name) => getFunctionCalls(response, name);
  if (submitted('submit_review').length !== 1 || submitted('submit_suggestions').length !== 1) {
    const error = new Error(
      'OpenAI response did not contain exactly one review and suggestion tool call',
    );
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
  const review = parseReviewToolResponse(response, 'submit_review', reviewCategories);
  const suggestions = parseReviewToolResponse(response, 'submit_suggestions', suggestionCategories);
  return {
    issues: review.issues,
    suggestions: suggestions.suggestions,
    verdict: review.verdict,
  };
}
