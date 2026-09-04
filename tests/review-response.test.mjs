import { parseReviewToolResponse } from '../src/review-response.mjs';

test('public response adapter re-exports review parsing', () => {
  expect(() => parseReviewToolResponse({ output: [] })).toThrow(
    'OpenAI response did not contain exactly one submit_review tool call',
  );
});
