import { removeSignalHandlers } from '../src/review-cleanup.mjs';
test('public cleanup barrel exports cleanup', () => {
  expect(typeof removeSignalHandlers).toBe('function');
});
