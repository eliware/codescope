import { createSuggestionTool, suggestionTool } from '../../src/prompts/suggestion-tool.mjs';

test('creates strict suggestion tools with required categories', () => {
  expect(suggestionTool.name).toBe('submit_suggestions');
  expect(createSuggestionTool(['tests']).parameters.properties.suggestions.required).toEqual([
    'tests',
  ]);
});
