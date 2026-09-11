import { assembleBenchmarkSummary } from '../../src/benchmark/summary-assembly.mjs';

test('assembles running and completed benchmark entries', () => {
  const summary = assembleBenchmarkSummary({
    cwd: 'repo',
    npmTest: { code: 0, elapsedMs: 10 },
    model: 'gpt-5.6-luna',
    pricing: {},
    efforts: ['none', 'low'],
    results: [{ effort: 'none', output: '{}', elapsedMs: 20, code: 0 }],
    logs: {},
  });
  expect(summary.status).toBe('incomplete');
  expect(summary.efforts.low).toEqual({ status: 'running' });
});
