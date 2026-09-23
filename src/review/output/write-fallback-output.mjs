import { serializeOutput } from '../serialize-output.mjs';
import { assertCompleteWrite } from './validate-write-result.mjs';

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
