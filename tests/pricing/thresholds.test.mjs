import {
  CACHE_WRITE_MULTIPLIER,
  LONG_CONTEXT_INPUT_MULTIPLIERS,
  LONG_CONTEXT_INPUT_THRESHOLD,
} from '../../src/pricing/thresholds.mjs';

test('defines long-context and cache-write policy constants', () => {
  expect(LONG_CONTEXT_INPUT_THRESHOLD).toBe(272000);
  expect(LONG_CONTEXT_INPUT_MULTIPLIERS).toEqual({ input: 2, output: 1.5 });
  expect(CACHE_WRITE_MULTIPLIER).toBe(1.25);
});
