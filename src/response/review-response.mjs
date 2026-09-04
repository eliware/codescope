import { parseCombinedToolResponse } from './combined-parser.mjs';
import { parseReviewToolResponse as parseReview } from './review-parser.mjs';
import { parseSuggestionToolResponse as parseSuggestions } from './suggestion-parser.mjs';
export { isValidReviewResult, isValidSuggestionResult } from './validators.mjs';

export function parseResponseTool(response, toolName = 'submit_review', categories) {
  if (toolName === 'submit_review') return parseReview(response, categories);
  if (toolName === 'submit_suggestions') return parseSuggestions(response, categories);
  throw new Error(`Unsupported Codescope tool: ${toolName}`);
}

export const parseReviewToolResponse = parseResponseTool;
export const parseSuggestionToolResponse = (response, categories) =>
  parseSuggestions(response, categories);
export { parseCombinedToolResponse };
