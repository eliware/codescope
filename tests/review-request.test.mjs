import { prepareRequest } from '../src/review-request.mjs';
test('public request barrel exports request preparation', () => {
  expect(typeof prepareRequest).toBe('function');
});
