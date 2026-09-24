import { readOutputText } from "./read-output-text.mjs";

export function responseText(response, request) {
  try {
    return readOutputText(response, request);
  } catch (cause) {
    if (cause?.code === "INVALID_RESPONSE") throw cause;
    const error = new Error(
      cause instanceof Error ? cause.message : "Provider response was invalid",
      { cause },
    );
    error.code = "INVALID_RESPONSE";
    throw error;
  }
}
