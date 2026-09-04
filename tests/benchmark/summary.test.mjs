import { parseBenchmarkOutput, reportBenchmarkResult } from '../../src/benchmark/summary.mjs';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeBenchmarkSummary } from '../../src/benchmark/summary.mjs';

test('parses valid and invalid benchmark output', () => {
  expect(parseBenchmarkOutput('{"verdict":"pass"}')).toEqual({ verdict: 'pass' });
  expect(parseBenchmarkOutput('not json')).toBeUndefined();
});

test('reports findings, usage, cost, and elapsed time', () => {
  const result = reportBenchmarkResult(
    'none',
    {
      output: JSON.stringify({
        issues: { correctness: [{ issue: 'x' }] },
        suggestions: { security: [{ suggestion: 'y' }] },
        usage: { input_tokens: 1, output_tokens: 1 },
        verdict: 'pass',
      }),
      elapsedMs: 120,
      code: 0,
    },
    { elapsedMs: 20 },
    'gpt-5.6-luna',
  );
  expect(result).toMatchObject({
    issues: 1,
    suggestions: 1,
    elapsedMinusNpmTestMs: 100,
    verdict: 'pass',
  });
});

test('writes incremental and complete summaries', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-benchmark-'));
  const file = path.join(directory, 'summary.json');
  const npmTest = { code: 0, elapsedMs: 10 };
  const result = { effort: 'none', output: '{"verdict":"pass"}', elapsedMs: 20, code: 0 };
  await writeBenchmarkSummary(file, {
    cwd: directory,
    npmTest,
    model: 'gpt-5.6-luna',
    pricing: {},
    efforts: ['none', 'low'],
    results: [result],
    logs: directory,
  });
  const partial = JSON.parse(await readFile(file, 'utf8'));
  expect(partial.status).toBe('incomplete');
  expect(partial.efforts.low).toEqual({ status: 'running' });
  await writeBenchmarkSummary(file, {
    cwd: directory,
    npmTest,
    model: 'gpt-5.6-luna',
    pricing: {},
    efforts: ['none'],
    results: [result],
    logs: directory,
  });
  expect(JSON.parse(await readFile(file, 'utf8')).status).toBe('complete');
});

test('reports malformed output without usage', () => {
  expect(
    reportBenchmarkResult(
      'none',
      { output: 'bad', elapsedMs: 1, code: 1 },
      { elapsedMs: 4 },
      'gpt-5.6-luna',
    ),
  ).toMatchObject({
    issues: null,
    suggestions: null,
    estimatedCostUsd: null,
    verdict: null,
  });
});

test('does not fail when usage has malformed nested details', () => {
  expect(
    reportBenchmarkResult(
      'none',
      {
        output: JSON.stringify({
          usage: {
            input_tokens: 10,
            output_tokens: 4,
            input_tokens_details: { cached_tokens: 'unknown' },
          },
          verdict: 'pass',
        }),
        elapsedMs: 1,
        code: 0,
      },
      { elapsedMs: 1 },
      'gpt-5.6-luna',
    ),
  ).toMatchObject({
    inputTokens: 10,
    outputTokens: 4,
    estimatedCostUsd: null,
    verdict: 'pass',
  });
});

test('does not mark a signaled zero-code benchmark complete', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-benchmark-signal-'));
  const file = path.join(directory, 'summary.json');
  await writeBenchmarkSummary(file, {
    cwd: directory,
    npmTest: { code: 0, elapsedMs: 1 },
    model: 'gpt-5.6-luna',
    pricing: {},
    efforts: ['none'],
    results: [{ effort: 'none', output: '{}', elapsedMs: 1, code: 0, signal: 'SIGTERM' }],
    logs: directory,
  });
  expect(JSON.parse(await readFile(file, 'utf8')).status).toBe('incomplete');
});
