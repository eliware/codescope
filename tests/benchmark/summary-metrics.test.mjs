import { projectBenchmarkMetrics } from '../../src/benchmark/summary-metrics.mjs';

test('projects empty benchmark metrics without usage', () => {
  expect(
    projectBenchmarkMetrics(
      'none',
      undefined,
      { elapsedMs: 20, code: 1 },
      { elapsedMs: 10 },
      'gpt-5.6-luna',
    ),
  ).toMatchObject({ effort: 'none', issues: null, suggestions: null, inputTokens: null });
});

test('projects findings and usage metrics', () => {
  const result = projectBenchmarkMetrics(
    'low',
    {
      issues: { security: [{ issue: 'x' }] },
      suggestions: { security: [{ suggestion: 'y' }] },
      usage: { input_tokens: 2, output_tokens: 3, total_tokens: 5 },
      verdict: 'pass',
    },
    { elapsedMs: 20, code: 0 },
    { elapsedMs: 10 },
    'gpt-5.6-luna',
  );
  expect(result).toMatchObject({ issues: 1, suggestions: 1, totalTokens: 5, verdict: 'pass' });
});
