import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { runProcess } from './runner.mjs';

export async function runEffortBenchmarks({
  options,
  onResult,
  execute = runProcess,
  save = writeFile,
  runtime = process,
}) {
  const started = performance.now();
  const results = [];
  let nextEffort = 0;
  const runEffort = async (effort) => {
    const result = await execute(
      runtime.execPath,
      [options.executable, 'all', `--model=${options.model}`, `--effort=${effort}`, '--usage'],
      options.cwd,
    );
    await save(`${options.logDirectory}/codescope-all-${effort}.log`, result.output, 'utf8');
    const completed = { effort, ...result };
    await onResult(completed);
    return completed;
  };
  const workers = Array.from({ length: Math.min(2, options.efforts.length) }, async () => {
    while (true) {
      const index = nextEffort++;
      if (index >= options.efforts.length) return;
      results[index] = await runEffort(options.efforts[index]);
    }
  });
  await Promise.all(workers);
  return { results, elapsedMs: performance.now() - started };
}
