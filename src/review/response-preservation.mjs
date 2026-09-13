import { summarizeProviderResponse } from './response-summary.mjs';
import { redactDiagnostic } from './redaction.mjs';

export function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  const summary = summarizeProviderResponse(response);
  try {
    const serialized = JSON.stringify(response);
    const diagnostic = redactDiagnostic(serialized);
    return {
      ...summary,
      response: diagnostic.text,
      ...(diagnostic.truncated ? { response_truncated: true } : {}),
      response_error: 'Provider response was not accepted by the response contract',
    };
  } catch {
    return {
      ...summary,
      response_error: 'Provider response could not be serialized',
    };
  }
}
