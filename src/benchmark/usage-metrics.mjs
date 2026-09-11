import { calculateUsageCost, normalizeUsage } from '../pricing.mjs';

export function usageMetrics(report, model) {
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
  return {
    inputTokens,
    outputTokens,
    totalTokens: usage?.total_tokens ?? null,
    cachedTokens: usage?.input_tokens_details?.cached_tokens ?? null,
    cacheWriteTokens: usage?.input_tokens_details?.cache_write_tokens ?? null,
    estimatedCostUsd: cost === null ? null : Number(cost.toFixed(6)),
  };
}
