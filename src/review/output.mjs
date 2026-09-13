// Writers may return undefined, true, or { written } when they report a
// character count. Explicit counts must account for the complete output.
function assertCompleteWrite(result, output) {
  if (result && typeof result === 'object' && 'written' in result && result.written !== output.length)
    throw new Error(`Writer reported a short write: ${result.written} of ${output.length} characters`);
}

export async function writeProviderResult(write, output, label = 'review') {
  try {
    const text = typeof output === 'string' ? output : String(output);
    const result = await write(text);
    assertCompleteWrite(result, text);
  } catch (cause) {
    throw new Error(
      `Unable to write ${label} output: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}

export async function writeFallbackResult(write, output) {
  try {
    await write(typeof output === 'string' ? output : String(output));
    return undefined;
  } catch (cause) {
    return cause;
  }
}
