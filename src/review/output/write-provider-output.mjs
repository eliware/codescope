import { serializeOutput } from '../serialize-output.mjs';
import { assertCompleteWrite } from './validate-write-result.mjs';

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
