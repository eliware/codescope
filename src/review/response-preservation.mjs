import { safeResponseSummary, serializeResponseDiagnostic } from './response-diagnostic.mjs';

export function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  const summary = safeResponseSummary(response);
  const diagnostic = serializeResponseDiagnostic(response);
  return {
    ...summary,
    ...diagnostic,
    response_error: diagnostic
      ? 'Provider response was not accepted by the response contract'
      : 'Provider response could not be serialized',
  };
}
