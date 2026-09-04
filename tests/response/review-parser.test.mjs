import { parseReviewToolResponse } from '../../src/response/review-parser.mjs';

test('parses a scoped review payload', () => {
  const result = { issues: { correctness: [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }] }, verdict: 'pass' };
  expect(parseReviewToolResponse({ output: [{ type: 'function_call', name: 'submit_review', arguments: JSON.stringify(result) }] }, ['correctness'])).toEqual(result);
});
