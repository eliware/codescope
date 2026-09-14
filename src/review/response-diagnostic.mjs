import { summarizeProviderResponse } from './response-summary.mjs';
import { redactDiagnostic } from './redaction.mjs';

export function safeResponseSummary(response) {
  try {
    return summarizeProviderResponse(response);
  } catch {
    return {};
  }
}

export function serializeResponseDiagnostic(response) {
  try {
    const serialized = JSON.stringify(response);
    if (typeof serialized !== 'string') return undefined;
    const diagnostic = redactDiagnostic(serialized);
    const responseTruncated = diagnostic.truncated || diagnostic.text.length >= 500_000;
    return {
      response: diagnostic.text,
      ...(responseTruncated ? { response_truncated: true } : {}),
    };
  } catch {
    return undefined;
  }
}
