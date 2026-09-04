import * as review from '../src/review.mjs';
test('public review barrel exports review execution', () => {
  expect(typeof review.runReview).toBe('function');
});
