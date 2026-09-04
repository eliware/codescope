import { categoryPrompt, DEFAULT_SUGGESTION_CATEGORIES, validateCategories } from './categories.mjs';
import { isValidSuggestionResult } from './validators.mjs';
import { parseToolArguments } from './tool-parser.mjs';
import { responseError } from './calls.mjs';

export function parseSuggestionToolResponse(response, categories) {
  const expectedCategories = categories ?? DEFAULT_SUGGESTION_CATEGORIES;
  validateCategories(expectedCategories);
  const result = parseToolArguments(response, 'submit_suggestions');
  if (!isValidSuggestionResult(result, categoryPrompt(expectedCategories, 'suggestions')))
    throw responseError('OpenAI submit_suggestions returned an invalid suggestions result');
  return result;
}
