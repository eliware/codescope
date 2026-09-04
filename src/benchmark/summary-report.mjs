import { calculateUsageCost } from '../pricing.mjs';

export function parseBenchmarkOutput(output) {
  try {
    return JSON.parse(output.trim());
  } catch {
    return undefined;
  }
}

const countFindings = (groups, field, emptyValue) =>
  Object.values(groups ?? {})
    .flat()
    .filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof item[field] === 'string' &&
        item[field] !== emptyValue,
    ).length;

export function reportBenchmarkResult(effort, result, npmTest, model) {
  const report = parseBenchmarkOutput(result.output);
  const usage = report?.usage;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const cost =
    inputTokens === null || outputTokens === null ? null : calculateUsageCost(model, usage);
  return {
    effort,
    issues: report ? countFindings(report.issues, 'issue', 'No issues found.') : null,
    suggestions: report
      ? countFindings(report.suggestions, 'suggestion', 'No suggestions found.')
      : null,
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
