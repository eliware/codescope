import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyConfigurationMessage(text) {
  return /OPENAI_API_TOKEN|\.codescope|environment variable/u.test(text)
    ? EXIT_CODES.CONFIGURATION
    : undefined;
}
