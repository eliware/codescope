import { formatRedactedDiagnostic } from "../redaction/format-redacted-diagnostic.mjs";

export function serializeResponseDiagnostic(response) {
  try {
    const serialized = JSON.stringify(response);
    if (typeof serialized !== "string") return undefined;
    const diagnostic = formatRedactedDiagnostic(serialized);
    const responseTruncated = diagnostic.truncated;
    return {
      response: diagnostic.text,
      ...(responseTruncated ? { response_truncated: true } : {}),
    };
  } catch {
    return undefined;
  }
}
