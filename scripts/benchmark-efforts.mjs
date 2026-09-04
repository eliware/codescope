import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_PRICING } from '../src/pricing.mjs';
import { benchmarkExitCode } from '../src/benchmark-status.mjs';
import { runProcess } from '../src/benchmark/runner.mjs';
import { writeBenchmarkSummary } from '../src/benchmark/summary.mjs';

const efforts = ['none', 'low', 'medium', 'high'];
const model =
  process.argv.find((value) => value.startsWith('--model='))?.slice('--model='.length) ??
  'gpt-5.6-luna';
if (!Object.hasOwn(API_PRICING, model))
  throw new Error(`Model must be one of: ${Object.keys(API_PRICING).join(', ')}`);
const pricing = API_PRICING[model];
const cwd = process.cwd();
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const executable = resolve(scriptDirectory, '..', 'bin', 'codescope.mjs');
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const logDirectory = resolve(cwd, 'benchmark-results', `effort-${stamp}`);
const summaryPath = resolve(logDirectory, 'summary.json');
let summaryWrite = Promise.resolve();

const updateSummary = (npmTest, results) => {
  summaryWrite = summaryWrite.then(() => writeBenchmarkSummary(summaryPath, {
    cwd, npmTest, model, pricing, efforts, results, logs: logDirectory,
  }));
  return summaryWrite;
};

await mkdir(logDirectory, { recursive: true });
console.log(`Running npm test in ${cwd}`);
const testCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const testArgs = ['test'];
const testResult = await runProcess(testCommand, testArgs, cwd);
await writeFile(resolve(logDirectory, 'npm-test.log'), testResult.output, 'utf8');
const completedResults = [];
await updateSummary(testResult, completedResults);
console.log(`npm test: ${testResult.elapsedMs.toFixed(0)} ms (exit ${testResult.code})`);

if (testResult.code !== 0) {
  console.error('npm test failed; skipping provider benchmark runs');
  process.exitCode = testResult.code ?? 1;
} else {
  console.log(`Running codescope all for ${efforts.join(', ')} in parallel`);
  const started = performance.now();
  const runEffort = async (effort) => {
      const result = await runProcess(process.execPath, [
        executable,
        'all',
        `--model=${model}`,
        `--effort=${effort}`,
        '--usage',
      ], cwd);
      await writeFile(resolve(logDirectory, `codescope-all-${effort}.log`), result.output, 'utf8');
      completedResults.push({ effort, ...result });
      await updateSummary(testResult, completedResults);
      return { effort, ...result };
  };
  const results = [];
  const workers = Array.from({ length: Math.min(2, efforts.length) }, async () => {
    while (results.length < efforts.length) {
      const effort = efforts[results.length];
      if (!effort) return;
      results.push(await runEffort(effort));
    }
  });
  await Promise.all(workers);

  if (benchmarkExitCode(results, efforts.length) !== 0) {
    console.error('One or more provider benchmark runs failed; benchmark is incomplete');
    process.exitCode = 1;
  }
  await summaryWrite;

  console.log(`\nLogs: ${logDirectory}`);
  console.log(`Parallel batch elapsed: ${(performance.now() - started).toFixed(0)} ms`);
  for (const result of results)
    console.log(`${result.effort}: ${result.elapsedMs.toFixed(0)} ms (exit ${result.code})`);
}
