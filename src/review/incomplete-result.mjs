import { preserveProviderResponse } from './response-preservation.mjs';

export function createIncompleteResult(cause, providerResponse) {
  const result = {
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: cause instanceof Error ? cause.message : String(cause),
  };
  const response = preserveProviderResponse(providerResponse);
  if (response !== undefined) result.response = response;
  return result;
}
