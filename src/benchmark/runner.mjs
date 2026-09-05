import { spawn } from 'node:child_process';

export function runProcess(command, args, cwd, spawnProcess = spawn, timeoutMs = 900_000) {
  const started = performance.now();
  return new Promise((resolve) => {
    const finish = (result) => resolve(result);
    const child = spawnProcess(command, args, {
      cwd,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const chunks = [];
    let settled = false;
    let fallbackTimer;
    let timer;
    const finishTimeout = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      finish({
        code: null,
        signal: 'SIGTERM',
        timedOut: true,
        output: Buffer.concat(chunks).toString('utf8'),
        elapsedMs: performance.now() - started,
      });
    };
    timer = setTimeout(() => {
      try {
        if (child.kill() === false) finishTimeout();
        else fallbackTimer = setTimeout(finishTimeout, 100);
      } catch {
        finishTimeout();
      }
    }, timeoutMs);
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => chunks.push(chunk));
    const onClose = (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      finish({
        code,
        signal,
        output: Buffer.concat(chunks).toString('utf8'),
        elapsedMs: performance.now() - started,
      });
    };
    const onError = (error) => {
      if (settled) return;
      settled = true;
      child.removeListener('close', onClose);
      child.removeListener('error', onError);
      child.stdout.removeListener('error', onError);
      child.stderr.removeListener('error', onError);
      clearTimeout(timer);
      finish({
        code: 1,
        signal: undefined,
        output: `${Buffer.concat(chunks).toString('utf8')}${String(error)}`,
        elapsedMs: performance.now() - started,
      });
    };
    child.once('error', onError);
    child.stdout.once('error', onError);
    child.stderr.once('error', onError);
    child.once('close', onClose);
  });
}
