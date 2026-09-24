import { classifyErrorCode } from "./errors/classify-code.mjs";
import { classifyErrorMessage } from "./errors/classify-message.mjs";
import { EXIT_CODES } from "./errors/exit-codes.mjs";

export function errorExitCode(cause) {
  return classifyErrorCode(cause) ?? classifyErrorMessage(cause) ?? EXIT_CODES.INPUT;
}
