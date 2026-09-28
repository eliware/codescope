import { redactTextOutput, MAX_REDACTED_TEXT_LENGTH } from "./redact-text-output.mjs";

export function formatRedactedDiagnostic(value) {
  const text = typeof value === "string" ? value : String(value ?? "");
  return {
    text: redactTextOutput(text),
    truncated: text.length > MAX_REDACTED_TEXT_LENGTH,
  };
}
