import { preserveProviderResponse } from "./response-preservation.mjs";

export function createIncompleteResult(cause, providerResponse) {
  try {
    const result = {
      issues: "not submitted",
      suggestions: "not submitted",
      error: cause instanceof Error ? cause.message : String(cause),
    };
    const response = preserveProviderResponse(providerResponse);
    if (response !== undefined) result.response = response;
    return result;
  } catch {
    return {
      issues: "not submitted",
      suggestions: "not submitted",
      error: "Failure details unavailable",
    };
  }
}
