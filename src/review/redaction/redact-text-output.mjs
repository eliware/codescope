import { redactText } from "@eliware/common";

export const MAX_REDACTED_TEXT_LENGTH = 500_000;

export function redactTextOutput(value) {
  return redactText(value, { maxOutputLength: MAX_REDACTED_TEXT_LENGTH });
}
