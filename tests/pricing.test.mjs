import { API_PRICING, calculateUsageCost, LONG_CONTEXT_INPUT_THRESHOLD } from '../src/pricing.mjs';

test('exposes current model rates and calculates standard usage', () => {
  expect(Object.keys(API_PRICING)).toEqual(['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol']);
  expect(
    calculateUsageCost('gpt-5.6-luna', { input_tokens: 100_000, output_tokens: 1_000_000 }),
  ).toBe(1.22);
});

test('prices cached, cache-write, and long-context usage', () => {
  const usage = {
    input_tokens: LONG_CONTEXT_INPUT_THRESHOLD + 10,
    input_tokens_details: { cached_tokens: 5, cache_write_tokens: 5 },
    output_tokens: 10,
  };
  expect(calculateUsageCost('gpt-5.6-terra', usage)).toBeCloseTo(1.088207, 6);
});

test('rejects unknown models', () => {
  expect(calculateUsageCost('gpt-5.6-luna', {})).toBe(0);
  expect(() => calculateUsageCost('unknown', {})).toThrow('Unknown pricing model');
});
