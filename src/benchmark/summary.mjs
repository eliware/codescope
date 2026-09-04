import { writeFile } from 'node:fs/promises';
import { parseBenchmarkOutput, reportBenchmarkResult } from './summary-report.mjs';
export { parseBenchmarkOutput, reportBenchmarkResult };

export async function writeBenchmarkSummary(
  path,
  { cwd, npmTest, model, pricing, efforts, results, logs },
) {
  const snapshot = results.map((result) => ({ ...result }));
  const uniqueResults = [...new Map(snapshot.map((result) => [result.effort, result])).values()];
  const summary = {
    cwd,
    npmTest: { exitCode: npmTest.code, elapsedMs: Math.round(npmTest.elapsedMs) },
    model,
    pricing,
    efforts: Object.fromEntries(
      efforts.map((effort) => {
        const result = uniqueResults.find((item) => item.effort === effort);
        return [
          effort,
          result ? reportBenchmarkResult(effort, result, npmTest, model) : { status: 'running' },
        ];
      }),
    ),
    logs,
    status:
      uniqueResults.length === efforts.length &&
      uniqueResults.every((result) => result.code === 0 && !result.signal)
        ? 'complete'
        : 'incomplete',
  };
  await writeFile(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}
