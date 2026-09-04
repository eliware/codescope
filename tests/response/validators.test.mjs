import { isValidReviewResult, isValidSuggestionResult } from '../../src/response/validators.mjs';

const prompt = (field, category) => ({
  tools: [{ parameters: { properties: { [field]: { properties: { [category]: {} } } } } }],
});

test('validates the focused review and suggestion result contracts', () => {
  expect(
    isValidReviewResult(
      {
        issues: { security: [{ severity: 'P1', location: 'a:1', issue: 'x', ignore_example: '' }] },
        verdict: 'block',
      },
      prompt('issues', 'security'),
    ),
  ).toBe(true);
  expect(
    isValidSuggestionResult(
      {
        suggestions: {
          security: [{ location: 'a:1', suggestion: 'x', rationale: 'y', ignore_example: '' }],
        },
      },
      prompt('suggestions', 'security'),
    ),
  ).toBe(true);
  expect(isValidReviewResult({}, undefined)).toBe(false);
  expect(isValidSuggestionResult({}, undefined)).toBe(false);
});
