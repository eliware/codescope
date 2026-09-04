import { spawn } from 'node:child_process';

export function runProcess(command, args, cwd) {
  const started = performance.now();
  return new Promise((resolve) => {
    const finish = (result) => resolve(result);
    const child = spawn(command, args, { cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => chunks.push(chunk));
    child.on('error', (error) =>
      finish({ code: 1, output: String(error), elapsedMs: performance.now() - started }),
    );
    child.on('close', (code, signal) => finish({
      code,
      signal,
      output: Buffer.concat(chunks).toString('utf8'),
      elapsedMs: performance.now() - started,
    }));
  });
}
