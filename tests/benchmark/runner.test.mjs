import { runProcess } from '../../src/benchmark/runner.mjs';

test('runs a process and captures output', async () => {
  const result = await runProcess(process.execPath, ['-e', 'process.stdout.write("ok")'], process.cwd());
  expect(result.code).toBe(0);
  expect(result.output).toBe('ok');
});

test('captures stderr and nonzero exits', async () => {
  const result = await runProcess(process.execPath, ['-e', 'process.stderr.write("bad"); process.exit(2)'], process.cwd());
  expect(result.code).toBe(2);
  expect(result.output).toContain('bad');
});

test('reports process spawn errors', async () => {
  const result = await runProcess('codescope-command-that-does-not-exist', [], process.cwd());
  expect(result.code).toBe(1);
  expect(result.output).toContain('ENOENT');
});
