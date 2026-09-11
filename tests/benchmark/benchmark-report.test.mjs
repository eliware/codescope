import { reportBenchmarkResult } from '../../src/benchmark/benchmark-report.mjs';

test('projects parsed benchmark findings and usage', () => {
  const report = reportBenchmarkResult(
    'medium',
    {
      output: JSON.stringify({ findings: { correctness: [{ finding: 'real' }] }, verdict: 'pass' }),
      elapsedMs: 120,
      code: 0,
    },
    { elapsedMs: 20 },
    'gpt-5.6-luna',
  );
  expect(report).toMatchObject({ issues: 1, elapsedMinusNpmTestMs: 100, verdict: 'pass' });
});
