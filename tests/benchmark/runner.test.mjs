import { runProcess } from '../../src/benchmark/runner.mjs';
import { EventEmitter } from 'node:events';

test('runs a process and captures output', async () => {
  const result = await runProcess(
    process.execPath,
    ['-e', 'process.stdout.write("ok")'],
    process.cwd(),
  );
  expect(result.code).toBe(0);
  expect(result.output).toBe('ok');
});

test('captures stderr and nonzero exits', async () => {
  const result = await runProcess(
    process.execPath,
    ['-e', 'process.stderr.write("bad"); process.exit(2)'],
    process.cwd(),
  );
  expect(result.code).toBe(2);
  expect(result.output).toContain('bad');
});

test('reports process spawn errors', async () => {
  const result = await runProcess('codescope-command-that-does-not-exist', [], process.cwd());
  expect(result.code).toBe(1);
  expect(result.output).toContain('ENOENT');
});

test('ignores a close event after an error', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  const resultPromise = runProcess('x', [], process.cwd(), () => child);
  child.emit('error', new Error('failed'));
  child.emit('close', 0, null);
  await expect(resultPromise).resolves.toMatchObject({ code: 1 });
});

test('ignores an error event after close', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  const resultPromise = runProcess('x', [], process.cwd(), () => child);
  child.emit('close', 0, null);
  child.emit('error', new Error('late failure'));
  await expect(resultPromise).resolves.toMatchObject({ code: 0 });
});

test('kills a process that exceeds its timeout', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = () => child.emit('close', null, 'SIGTERM');
  await expect(runProcess('x', [], process.cwd(), () => child, 1)).resolves.toMatchObject({
    signal: 'SIGTERM',
  });
});

test('returns timeout when the child refuses to be killed', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = () => false;
  await expect(runProcess('x', [], process.cwd(), () => child, 1)).resolves.toMatchObject({
    timedOut: true,
    code: null,
  });
});

test('returns timeout when killing the child throws', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = () => {
    throw new Error('kill failed');
  };
  await expect(runProcess('x', [], process.cwd(), () => child, 1)).resolves.toMatchObject({
    timedOut: true,
    code: null,
  });
});

test('falls back when a killed child never closes', async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = () => true;
  const resultPromise = runProcess('x', [], process.cwd(), () => child, 1);
  await expect(resultPromise).resolves.toMatchObject({ timedOut: true, code: null });
  child.emit('close', null, 'SIGTERM');
});
