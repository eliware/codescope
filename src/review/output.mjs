export async function writeProviderResult(write, output, label = 'review') {
  try {
    await write(typeof output === 'string' ? output : String(output));
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
