import { summarizeProviderResponse } from '../response-summary.mjs';

export function safeResponseSummary(response) {
  try {
    return summarizeProviderResponse(response);
  } catch {
    return {};
  }
}
