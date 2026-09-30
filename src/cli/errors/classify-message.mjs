import { readErrorChainText } from "./cause-chain/read-error-chain-text.mjs";
import { classifyTimeoutMessage } from "./classify-timeout.mjs";
import { classifyUsageMessage } from "./classify-usage.mjs";
import { classifyConfigurationMessage } from "./classify-configuration.mjs";
import { classifyInputMessage } from "./classify-input.mjs";
import { classifyApiMessage } from "./classify-api.mjs";

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
