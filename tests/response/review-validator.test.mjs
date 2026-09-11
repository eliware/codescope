import { isValidReviewResult } from '../../src/response/review-validator.mjs';

test('validates a review category payload', () => {
  const prompt = {
    tools: [{ parameters: { properties: { issues: { properties: { security: {} } } } } }],
  };
  expect(isValidReviewResult({ issues: { security: [] }, verdict: 'pass' }, prompt)).toBe(true);
});
