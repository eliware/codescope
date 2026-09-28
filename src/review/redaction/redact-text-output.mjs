import { redactText } from "@eliware/redact";

export const MAX_REDACTED_TEXT_LENGTH = 500_000;

export function redactTextOutput(value) {
  return redactText(value, { maxString: MAX_REDACTED_TEXT_LENGTH });
}
