import { errorChainHasCode } from "./cause-chain.mjs";
import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyErrorCode(cause) {
  if (errorChainHasCode(cause, "SIGINT")) return EXIT_CODES.SIGINT;
  if (errorChainHasCode(cause, "SIGTERM")) return EXIT_CODES.SIGTERM;
  if (cause?.code === "API") return EXIT_CODES.API;
  if (cause?.code === "INVALID_RESPONSE") return EXIT_CODES.RESPONSE;
  if (cause?.code === "ETIMEDOUT") return EXIT_CODES.TEST_TIMEOUT;
  return undefined;
}
