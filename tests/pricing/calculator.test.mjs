import {
  API_PRICING,
  calculateUsageCost,
  calculateUsageCostBreakdown,
  LONG_CONTEXT_INPUT_THRESHOLD,
} from '../../src/pricing/calculator.mjs';

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

test('rejects malformed usage metadata', () => {
  for (const usage of [
    { input_tokens: -1 },
    { output_tokens: 1.5 },
    { input_tokens: '10' },
    { input_tokens: Number.NaN },
    { input_tokens: 2, input_tokens_details: { cached_tokens: 3 } },
  ])
    expect(() => calculateUsageCost('gpt-5.6-luna', usage)).toThrow(/usage/i);
  expect(() => calculateUsageCost('gpt-5.6-luna', null)).toThrow('Usage must be an object');
});

test('returns an auditable cost breakdown', () => {
  expect(
    calculateUsageCostBreakdown('gpt-5.6-luna', { input_tokens: 10, output_tokens: 2 }),
  ).toEqual({
    input_tokens: 10,
    cached_tokens: 0,
    cache_write_tokens: 0,
    output_tokens: 2,
    uncached_input_cost_usd: 0.000002,
    cached_input_cost_usd: 0,
    cache_write_cost_usd: 0,
    output_cost_usd: 0.000002,
    estimated_cost_usd: 0.000004,
  });
});
