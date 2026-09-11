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
