import * as combine from '../src/combine-all.mjs';
test('public combine-all barrel exports its contract', () => {
  expect(typeof combine.combineAllFiles).toBe('function');
  expect(typeof combine.combineSelectedFiles).toBe('function');
});
