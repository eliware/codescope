import { errorChainHasCode } from "./cause-chain/error-chain-has-code.mjs";
import { EXIT_CODES } from "./exit-codes.mjs";

const TIMEOUT_CODES = ["ETIMEDOUT", "ECONNABORTED", "UND_ERR_CONNECT_TIMEOUT"];

export function classifyErrorCode(cause) {
  if (errorChainHasCode(cause, "SIGINT")) return EXIT_CODES.SIGINT;
  if (errorChainHasCode(cause, "SIGTERM")) return EXIT_CODES.SIGTERM;
  if (cause?.code === "API") return EXIT_CODES.API;
  if (cause?.code === "INVALID_RESPONSE") return EXIT_CODES.RESPONSE;
  if (TIMEOUT_CODES.some((code) => errorChainHasCode(cause, code))) return EXIT_CODES.TIMEOUT;
  return undefined;
}
