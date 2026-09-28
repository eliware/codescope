import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyUsageMessage(text) {
  return /Usage:|Unknown command|Unknown option|Unexpected arguments|requires a value|Effort must be|not valid for/u.test(
    text,
  )
    ? EXIT_CODES.USAGE
    : undefined;
}
