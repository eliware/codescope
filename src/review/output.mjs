import { bestEffortPrettyPrint } from './pretty-print.mjs';

export async function writeJsonResult(write, output, label = 'review') {
  try {
    await write(`${bestEffortPrettyPrint(output)}\n`);
  } catch (cause) {
    throw new Error(
      `Unable to write ${label} output: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}

export async function writeFallbackResult(write, output) {
  try {
    await write(`${bestEffortPrettyPrint(output)}\n`);
  } catch {
    // Preserve the original provider or validation failure when fallback output cannot be written.
  }
}
