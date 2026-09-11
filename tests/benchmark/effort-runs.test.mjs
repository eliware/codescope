import { runEffortBenchmarks } from '../../src/benchmark/effort-runs.mjs';

test('runs each effort and reports results as they complete', async () => {
  const reported = [];
  const saved = [];
  const result = await runEffortBenchmarks({
    options: {
      cwd: 'repo',
      executable: 'codescope',
      model: 'model',
      efforts: ['none', 'low'],
      logDirectory: 'logs',
    },
    execute: async (command, args) => ({ code: 0, output: `${command}:${args[2]}`, elapsedMs: 1 }),
    save: async (...args) => saved.push(args),
    runtime: { execPath: 'node' },
    onResult: async (item) => reported.push(item.effort),
  });
  expect(result.results.map(({ effort }) => effort)).toEqual(['none', 'low']);
  expect(reported).toHaveLength(2);
  expect(saved).toHaveLength(2);
});
