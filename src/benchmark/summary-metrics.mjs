import { findingCounts } from './finding-metrics.mjs';
import { usageMetrics } from './usage-metrics.mjs';

export function projectBenchmarkMetrics(effort, report, result, npmTest, model) {
  return {
    effort,
    ...findingCounts(report),
    ...usageMetrics(report, model),
    elapsedMs: Math.round(result.elapsedMs),
    elapsedMinusNpmTestMs: Math.max(0, Math.round(result.elapsedMs - npmTest.elapsedMs)),
    verdict: report?.verdict ?? null,
    exitCode: result.code,
    signal: result.signal ?? null,
  };
}
