import {
  parseBenchmarkOutput,
  reportBenchmarkResult,
} from '../../src/benchmark/summary-report.mjs';

test('parses valid and invalid benchmark output', () => {
  expect(parseBenchmarkOutput('{"findings":{},"verdict":"pass"}')).toEqual({
    findings: {},
    verdict: 'pass',
  });
  expect(parseBenchmarkOutput(' {"verdict":"pass"} ')).toBeUndefined();
  expect(parseBenchmarkOutput('not json')).toBeUndefined();
});

test('reports unified finding counts and usage', () => {
  const report = reportBenchmarkResult(
    'medium',
    {
      output: JSON.stringify({
        findings: { correctness: [{ finding: 'real' }, { finding: 'No issues found.' }] },
        suggestions: { correctness: [{ suggestion: 'real' }] },
        usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
        verdict: 'pass',
      }),
      elapsedMs: 120,
      code: 0,
    },
    { elapsedMs: 20 },
    'gpt-5.6-luna',
  );
  expect(report).toMatchObject({
    issues: 1,
    suggestions: 1,
    elapsedMinusNpmTestMs: 100,
    totalTokens: 15,
    verdict: 'pass',
  });
});

test('reports legacy issues, missing output, malformed usage, and signals', () => {
  const legacy = reportBenchmarkResult(
    'none',
    {
      output: JSON.stringify({
        issues: {
          security: [{ issue: 'real' }, { issue: 'No issues found.' }, null, 'not an item'],
        },
        usage: { input_tokens: 1, output_tokens: 2 },
      }),
      elapsedMs: 4.4,
      code: 1,
      signal: 'SIGTERM',
    },
    { elapsedMs: 10 },
    'unknown-model',
  );
  expect(legacy).toMatchObject({
    issues: 1,
    suggestions: 0,
    elapsedMs: 4,
    elapsedMinusNpmTestMs: 0,
    inputTokens: 1,
    outputTokens: 2,
    totalTokens: null,
    signal: 'SIGTERM',
    verdict: null,
  });

  expect(
    reportBenchmarkResult(
      'high',
      { output: 'not json', elapsedMs: 1, code: 2 },
      { elapsedMs: 1 },
      'gpt-5.6-luna',
    ),
  ).toMatchObject({
    issues: null,
    suggestions: null,
    inputTokens: null,
    outputTokens: null,
    estimatedCostUsd: null,
  });
});
