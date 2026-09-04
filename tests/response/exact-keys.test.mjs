import { exactKeys } from '../../src/response/exact-keys.mjs';

test('accepts plain objects with exactly the requested keys', () => {
  expect(exactKeys({ a: 1, b: 2 }, ['a', 'b'])).toBe(true);
  expect(exactKeys({ a: 1 }, ['a', 'b'])).toBe(false);
  expect(exactKeys({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toBe(false);
  expect(exactKeys(null, ['a'])).toBe(false);
  expect(exactKeys([], [])).toBe(false);
});
