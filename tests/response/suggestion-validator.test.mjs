import { isValidSuggestionResult } from '../../src/response/suggestion-validator.mjs';

test('validates a suggestion category payload', () => {
  const prompt = {
    tools: [{ parameters: { properties: { suggestions: { properties: { security: {} } } } } }],
  };
  expect(isValidSuggestionResult({ suggestions: { security: [] } }, prompt)).toBe(true);
});
