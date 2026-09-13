import { summarizeProviderResponse } from './response-summary.mjs';

export function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  const summary = summarizeProviderResponse(response);
  try {
    JSON.stringify(response);
    return {
      ...summary,
      response_error: 'Provider response was not accepted by the response contract',
    };
  } catch {
    return {
      ...summary,
      response_error: 'Provider response could not be serialized',
    };
  }
}
