import { calculateUsageCostBreakdown } from '../pricing/calculator.mjs';

export function withReviewUsage(result, providerResponse, model, includeUsage) {
  if (!includeUsage) return result;
  const providerUsage = readProviderUsage(providerResponse);
  return {
    ...result,
    usage: providerUsage
      ? {
          ...providerUsage,
          ...calculateUsageCostBreakdown(model ?? 'gpt-5.6-luna', providerUsage),
        }
      : null,
  };
}

export function readProviderUsage(providerResponse) {
  try {
    const value = providerResponse?.usage;
    return value && typeof value === 'object' ? { ...value } : null;
  } catch {
    return null;
  }
}
