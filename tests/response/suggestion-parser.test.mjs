import { parseSuggestionToolResponse } from '../../src/response/suggestion-parser.mjs';

test('parses a scoped suggestion payload', () => {
  const result = { suggestions: { correctness: [{ location: 'none', suggestion: 'No suggestions found.', rationale: '', ignore_example: '' }] } };
  expect(parseSuggestionToolResponse({ output: [{ type: 'function_call', name: 'submit_suggestions', arguments: JSON.stringify(result) }] }, ['correctness'])).toEqual(result);
});
