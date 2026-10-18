import { readErrorChainText } from "../cause-chain/read-error-chain-text.mjs";
import { classifyTimeoutMessage } from "./timeout.mjs";
import { classifyUsageMessage } from "./usage.mjs";
import { classifyConfigurationMessage } from "./configuration.mjs";
import { classifyInputMessage } from "./input.mjs";
import { classifyApiMessage } from "./api.mjs";

export function classifyErrorMessage(cause) {
  const text = readErrorChainText(cause);
  return (
    classifyTimeoutMessage(text) ??
    classifyUsageMessage(text) ??
    classifyConfigurationMessage(text) ??
    classifyInputMessage(text) ??
    classifyApiMessage(text)
  );
}
