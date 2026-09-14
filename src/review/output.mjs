// Writers must report an explicit complete character count.
function assertCompleteWrite(result, output) {
  if (result && typeof result === 'object' && 'written' in result) {
    if (!Number.isInteger(result.written) || result.written < 0)
      throw new Error('Writer reported an invalid written character count');
    if (result.written !== output.length)
      throw new Error(`Writer reported a short write: ${result.written} of ${output.length} characters`);
    return;
  }
  throw new Error('Writer returned an unsupported result; expected { written }');
}

function outputText(output) {
  if (typeof output === 'string') return output;
  try {
    const serialized = JSON.stringify(output, (_key, value) => {
      if (typeof value === 'bigint') return { type: 'bigint', value: value.toString() };
      if (typeof value === 'symbol') return { type: 'symbol', value: String(value) };
      if (typeof value === 'function') return { type: 'function', value: String(value) };
      return value;
    });
    return serialized === undefined ? JSON.stringify({ type: typeof output }) : serialized;
  } catch {
    return JSON.stringify({ type: 'unserializable' });
  }
}

export async function writeProviderResult(write, output, label = 'review') {
  try {
    const text = outputText(output);
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
    const text = outputText(output);
    const result = await write(text);
    assertCompleteWrite(result, text);
    return undefined;
  } catch (cause) {
    return cause;
  }
}
