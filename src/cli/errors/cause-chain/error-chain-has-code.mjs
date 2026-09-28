import { iterateErrorChain } from "./iterate-error-chain.mjs";

export function errorChainHasCode(cause, code) {
  for (const current of iterateErrorChain(cause)) {
    if (current.code === code) return true;
  }
  return false;
}
