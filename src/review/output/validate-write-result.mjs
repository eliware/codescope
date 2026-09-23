export function assertCompleteWrite(result, output) {
  if (result && typeof result === 'object' && 'written' in result) {
    if (!Number.isInteger(result.written) || result.written < 0)
      throw new Error('Writer reported an invalid written character count');
    if (result.written !== output.length)
      throw new Error(`Writer reported a short write: ${result.written} of ${output.length} characters`);
    return;
  }
  throw new Error('Writer returned an unsupported result; expected { written }');
}
