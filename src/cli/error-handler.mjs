import { errorExitCode } from "./errors.mjs";

export async function runWithCliErrors(operation, error = console.error) {
  try {
    return await operation();
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    const details = Object.fromEntries(
      ["status", "code", "type", "parameter", "requestId"]
        .filter((field) => cause?.[field] !== undefined)
        .map((field) => [field, cause[field]]),
    );
    if (Object.keys(details).length) error(`OpenAI error details: ${JSON.stringify(details)}`);
    if (cause instanceof Error && cause.message.startsWith("Unknown command"))
      error('Run "codescope --help" for usage.');
    return errorExitCode(cause);
  }
}
