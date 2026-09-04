import { normalizeUsage } from '../../src/pricing/usage-normalizer.mjs';

test('normalizes omitted usage fields to zero', () => {
  expect(normalizeUsage()).toEqual({ input: 0, cachedInput: 0, cacheWrite: 0, output: 0 });
});

test('rejects invalid and contradictory usage', () => {
  expect(() => normalizeUsage(null)).toThrow(/Usage/);
  expect(() => normalizeUsage({ input_tokens: -1 })).toThrow(/input_tokens/);
  expect(() =>
    normalizeUsage({
      input_tokens: 1,
      input_tokens_details: { cached_tokens: 1, cache_write_tokens: 1 },
    }),
  ).toThrow(/exceed/);
});
