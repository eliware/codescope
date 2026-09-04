import * as response from '../src/review-response.mjs';
test('public response barrel exports response contracts', () => {
  expect(typeof response.parseReviewToolResponse).toBe('function');
  expect(typeof response.parseCombinedToolResponse).toBe('function');
});
