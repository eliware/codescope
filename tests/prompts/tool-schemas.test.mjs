import { createReviewTool, createSuggestionTool } from '../../src/prompts/tool-schemas.mjs';

test('creates strict schemas for selected categories', () => {
  expect(createReviewTool(['security']).strict).toBe(true);
  expect(
    Object.keys(
      createSuggestionTool(['new-features']).parameters.properties.suggestions.properties,
    ),
  ).toEqual(['new-features']);
});
