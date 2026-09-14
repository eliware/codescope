import { serializeOutput } from './serialize-output.mjs';

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

export async function writeProviderResult(write, output, label = 'review') {
  try {
    const text = typeof output === 'string' ? output : serializeOutput(output);
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
    const text = typeof output === 'string' ? output : serializeOutput(output);
    const result = await write(text);
    assertCompleteWrite(result, text);
    return undefined;
  } catch (cause) {
    return cause;
  }
}
