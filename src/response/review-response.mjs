import { parseCombinedToolResponse } from './combined-parser.mjs';
import { parseReviewToolResponse as parseReview } from './review-parser.mjs';
import { parseSuggestionToolResponse as parseSuggestions } from './suggestion-parser.mjs';
import { parseUnifiedToolResponse } from './unified-parser.mjs';
export { isValidUnifiedResult, parseUnifiedToolResponse } from './unified-parser.mjs';
export { isValidReviewResult, isValidSuggestionResult } from './validators.mjs';

export function parseResponseTool(response, toolName, categories) {
  if (typeof toolName !== 'string') throw new Error('A Codescope tool name is required');
  if (toolName === 'submit_review') return parseReview(response, categories);
  if (toolName === 'submit_suggestions') return parseSuggestions(response, categories);
  if (toolName === 'submit_unified_review') return parseUnifiedToolResponse(response, categories);
  throw new Error(`Unsupported Codescope tool: ${toolName}`);
}

export function parseReviewToolResponse(response, toolNameOrCategories, categories) {
  if (typeof toolNameOrCategories === 'string' && toolNameOrCategories !== 'submit_review')
    throw new Error(`Unsupported Codescope tool: ${toolNameOrCategories}`);
  return parseReview(
    response,
    Array.isArray(toolNameOrCategories) ? toolNameOrCategories : categories,
  );
}

export function parseSuggestionToolResponse(response, categories) {
  return parseSuggestions(response, categories);
}
export { parseCombinedToolResponse };
