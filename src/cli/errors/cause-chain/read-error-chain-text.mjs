import { iterateErrorChain } from "./iterate-error-chain.mjs";

export function readErrorChainText(cause) {
  const messages = [];
  for (const current of iterateErrorChain(cause)) {
    if (current instanceof Error || typeof current?.message === "string")
      messages.push(current.message);
  }
  return messages.join(" ");
}
