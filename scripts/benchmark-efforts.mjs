import process from 'node:process';
import { benchmarkExitCode } from '../src/benchmark-status.mjs';
import { runEffortBenchmarks } from '../src/benchmark/effort-runs.mjs';
import { resolveBenchmarkOptions } from '../src/benchmark/options.mjs';
import { writeBenchmarkSummary } from '../src/benchmark/summary.mjs';

const options = resolveBenchmarkOptions(process.argv.slice(2), process.cwd());
const completedResults = [];
let summaryWrite = Promise.resolve();
const updateSummary = (npmTest) => {
  summaryWrite = summaryWrite.then(() =>
    writeBenchmarkSummary(options.summaryPath, {
      ...options,
      npmTest,
      results: completedResults,
      logs: options.logDirectory,
    }),
  );
  return summaryWrite;
};

const testResult = { code: 0, elapsedMs: 0, output: '' };
await updateSummary(testResult);
console.log(`Running codescope all for ${options.efforts.join(', ')} in parallel`);
const benchmark = await runEffortBenchmarks({
  options,
  onResult: async (result) => {
    completedResults.push(result);
    await updateSummary(testResult);
  },
});
if (benchmarkExitCode(benchmark.results, options.efforts.length) !== 0) {
  console.error('One or more provider benchmark runs failed; benchmark is incomplete');
  process.exitCode = 1;
}
await summaryWrite;
console.log(`\nLogs: ${options.logDirectory}`);
console.log(`Parallel batch elapsed: ${benchmark.elapsedMs.toFixed(0)} ms`);
for (const result of benchmark.results)
  console.log(`${result.effort}: ${result.elapsedMs.toFixed(0)} ms (exit ${result.code})`);
