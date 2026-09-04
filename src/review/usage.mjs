import { calculateUsageCostBreakdown } from '../pricing/calculator.mjs';

export function withReviewUsage(result, providerResponse, model, includeUsage) {
  if (!includeUsage) return result;
  return {
    ...result,
    usage: providerResponse.usage
      ? {
          ...providerResponse.usage,
          ...calculateUsageCostBreakdown(model ?? 'gpt-5.6-luna', providerResponse.usage),
        }
      : null,
  };
}
