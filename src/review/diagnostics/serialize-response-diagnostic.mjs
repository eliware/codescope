import { redactDiagnostic } from '../redaction.mjs';

export function serializeResponseDiagnostic(response) {
  try {
    const serialized = JSON.stringify(response);
    if (typeof serialized !== 'string') return undefined;
    const diagnostic = redactDiagnostic(serialized);
    const responseTruncated = diagnostic.truncated;
    return {
      response: diagnostic.text,
      ...(responseTruncated ? { response_truncated: true } : {}),
    };
  } catch {
    return undefined;
  }
}
