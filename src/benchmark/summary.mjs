import { writeFile } from 'node:fs/promises';
import { parseBenchmarkOutput, reportBenchmarkResult } from './summary-report.mjs';
export { parseBenchmarkOutput, reportBenchmarkResult };

export async function writeBenchmarkSummary(
  path,
  { cwd, npmTest, model, pricing, efforts, results, logs },
) {
  const snapshot = results.map((result) => ({ ...result }));
  const uniqueResults = [...new Map(snapshot.map((result) => [result.effort, result])).values()];
  const duplicateEfforts = [
    ...new Set(
      snapshot
        .map((result) => result.effort)
        .filter((effort, index, all) => all.indexOf(effort) !== index),
    ),
  ];
  const resultByEffort = new Map(uniqueResults.map((result) => [result.effort, result]));
  const declaredEfforts = new Set(efforts);
  const hasExactEfforts =
    resultByEffort.size === declaredEfforts.size &&
    [...declaredEfforts].every((effort) => resultByEffort.has(effort)) &&
    [...resultByEffort.keys()].every((effort) => declaredEfforts.has(effort));
  const summary = {
    cwd,
    npmTest: { exitCode: npmTest.code, elapsedMs: Math.round(npmTest.elapsedMs) },
    model,
    pricing,
    duplicateEfforts,
    efforts: Object.fromEntries(
      efforts.map((effort) => {
        const result = resultByEffort.get(effort);
        return [
          effort,
          result ? reportBenchmarkResult(effort, result, npmTest, model) : { status: 'running' },
        ];
      }),
    ),
    logs,
    status:
      hasExactEfforts &&
      [...resultByEffort.values()].every((result) => result.code === 0 && !result.signal)
        ? 'complete'
        : 'incomplete',
  };
  await writeFile(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}
