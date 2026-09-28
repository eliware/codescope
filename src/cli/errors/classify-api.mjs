import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyApiMessage(text) {
  return /OpenAI|API request|initialize OpenAI|authentication/u.test(text)
    ? EXIT_CODES.API
    : undefined;
}
