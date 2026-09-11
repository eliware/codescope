import { parsePlainTextJsonResponse } from './plain-text-response.mjs';
import { readProviderUsage } from './usage.mjs';

export function plainTextSessionResult(providerResponse, usage) {
  const output = parsePlainTextJsonResponse(providerResponse);
  return {
    output,
    result: { ...output, ...(usage ? { usage: readProviderUsage(providerResponse) } : {}) },
  };
}
