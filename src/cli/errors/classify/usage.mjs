import { EXIT_CODES } from "../exit-codes.mjs";

export function classifyUsageMessage(text) {
  return /Usage:|Unknown command|Unknown option|Unexpected arguments|requires a value|Reasoning level must be|Model must be one of|not valid for/iu.test(
    text,
  )
    ? EXIT_CODES.USAGE
    : undefined;
}
