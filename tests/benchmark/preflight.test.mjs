import { runBenchmarkPreflight } from '../../src/benchmark/preflight.mjs';

test('runs npm test and persists its output', async () => {
  const calls = [];
  const result = await runBenchmarkPreflight(
    { cwd: 'repo', logDirectory: 'logs' },
    async (...args) => {
      calls.push(args);
      return { output: 'ok', code: 0 };
    },
    async (...args) => calls.push(['mkdir', ...args]),
    async (...args) => calls.push(['write', ...args]),
    'linux',
  );
  expect(result.code).toBe(0);
  expect(calls[0][0]).toBe('mkdir');
  expect(calls.some(([kind, path]) => kind === 'write' && path.endsWith('npm-test.log'))).toBe(
    true,
  );
});

test('uses the Windows npm executable when requested', async () => {
  let command;
  await runBenchmarkPreflight(
    { cwd: 'repo', logDirectory: 'logs' },
    async (value) => {
      command = value;
      return { output: '', code: 0 };
    },
    async () => {},
    async () => {},
    'win32',
  );
  expect(command).toBe('npm.cmd');
});
