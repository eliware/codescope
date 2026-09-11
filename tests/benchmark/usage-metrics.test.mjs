import { usageMetrics } from '../../src/benchmark/usage-metrics.mjs';

test('projects absent usage safely', () => {
  expect(usageMetrics(undefined, 'gpt-5.6-luna')).toMatchObject({
    inputTokens: null,
    estimatedCostUsd: null,
  });
});

test('omits cost when usage cannot be priced', () => {
  expect(
    usageMetrics({ usage: { input_tokens: 1, output_tokens: 1 } }, 'unknown').estimatedCostUsd,
  ).toBeNull();
});
