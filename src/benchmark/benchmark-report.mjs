import { projectBenchmarkMetrics } from './summary-metrics.mjs';
import { parseBenchmarkOutput } from './benchmark-output-parser.mjs';

export function reportBenchmarkResult(effort, result, npmTest, model) {
  const report = parseBenchmarkOutput(result.output);
  return projectBenchmarkMetrics(effort, report, result, npmTest, model);
}
