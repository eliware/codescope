import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyTimeoutMessage(text) {
  return /timed out/u.test(text) ? EXIT_CODES.TEST_TIMEOUT : undefined;
}
