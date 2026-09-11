import { reportBenchmarkResult } from './summary-report.mjs';
import { validateSummaryEfforts } from './summary-validation.mjs';

export function assembleBenchmarkSummary({ cwd, npmTest, model, pricing, efforts, results, logs }) {
  const { duplicateEfforts, resultByEffort, hasExactEfforts } = validateSummaryEfforts(
    results,
    efforts,
  );
  return {
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
}
