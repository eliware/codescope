import { categoryPrompt, DEFAULT_REVIEW_CATEGORIES, validateCategories } from './categories.mjs';
import { isValidReviewResult } from './validators.mjs';
import { parseToolArguments } from './tool-parser.mjs';
import { responseError } from './calls.mjs';

export function parseReviewToolResponse(response, categories) {
  const expectedCategories = categories ?? DEFAULT_REVIEW_CATEGORIES;
  validateCategories(expectedCategories);
  const result = parseToolArguments(response, 'submit_review');
  if (!isValidReviewResult(result, categoryPrompt(expectedCategories, 'issues')))
    throw responseError('OpenAI submit_review returned an invalid review result');
  return result;
}
