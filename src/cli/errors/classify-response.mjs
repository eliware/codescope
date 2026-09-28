import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyResponseMessage(text) {
  return /Invalid (review|suggestion|combined|tool|function) response|verdict|category array/u.test(
    text,
  )
    ? EXIT_CODES.RESPONSE
    : undefined;
}
