import { calculateUsageCost, normalizeUsage } from '../pricing.mjs';

export function parseBenchmarkOutput(output) {
  try {
    const report = JSON.parse(output.trim());
    if (
      !report ||
      typeof report !== 'object' ||
      Array.isArray(report) ||
      (!('findings' in report) && !('issues' in report) && !('suggestions' in report))
    )
      return undefined;
    return report;
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
  let cost = null;
  if (inputTokens !== null && outputTokens !== null) {
    try {
      normalizeUsage(usage);
      cost = calculateUsageCost(model, usage);
    } catch {
      cost = null;
    }
  }
  const issueGroups = report?.findings ?? report?.issues;
  return {
    effort,
    issues: report
      ? countFindings(issueGroups, report.findings ? 'finding' : 'issue', 'No issues found.')
      : null,
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
