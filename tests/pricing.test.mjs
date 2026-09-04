import * as pricing from '../src/pricing.mjs';
test('public pricing barrel exports pricing functions', () => {
  expect(typeof pricing.calculateUsageCost).toBe('function');
  expect(typeof pricing.normalizeUsage).toBe('function');
});
