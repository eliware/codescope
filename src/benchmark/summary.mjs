import { writeFile } from 'node:fs/promises';
import { calculateUsageCost } from '../pricing.mjs';

export function parseBenchmarkOutput(output) {
  try { return JSON.parse(output.trim()); } catch { return undefined; }
}

const countFindings = (groups, field, emptyValue) =>
  Object.values(groups ?? {}).flat().filter((item) => item?.[field] !== emptyValue).length;

export function reportBenchmarkResult(effort, result, npmTest, model) {
  const report = parseBenchmarkOutput(result.output);
  const usage = report?.usage;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const cost = inputTokens === null || outputTokens === null ? null : calculateUsageCost(model, usage);
  return {
    effort,
    issues: report ? countFindings(report.issues, 'issue', 'No issues found.') : null,
    suggestions: report ? countFindings(report.suggestions, 'suggestion', 'No suggestions found.') : null,
    elapsedMs: Math.round(result.elapsedMs),
    elapsedMinusNpmTestMs: Math.max(0, Math.round(result.elapsedMs - npmTest.elapsedMs)),
    inputTokens,
    outputTokens,
    totalTokens: usage?.total_tokens ?? null,
    cachedTokens: usage?.input_tokens_details?.cached_tokens ?? null,
    cacheWriteTokens: usage?.input_tokens_details?.cache_write_tokens ?? null,
    estimatedCostUsd: cost === null ? null : Number(cost.toFixed(6)),
    verdict: report?.verdict ?? null,
    exitCode: result.code,
    signal: result.signal ?? null,
  };
}

export async function writeBenchmarkSummary(path, { cwd, npmTest, model, pricing, efforts, results, logs }) {
  const summary = {
    cwd,
    npmTest: { exitCode: npmTest.code, elapsedMs: Math.round(npmTest.elapsedMs) },
    model,
    pricing,
    efforts: Object.fromEntries(efforts.map((effort) => {
      const result = results.find((item) => item.effort === effort);
      return [effort, result ? reportBenchmarkResult(effort, result, npmTest, model) : { status: 'running' }];
    })),
    logs,
    status: results.length === efforts.length && results.every((result) => result.code === 0) ? 'complete' : 'incomplete',
  };
  await writeFile(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}
