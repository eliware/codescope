export function readScalar(tokens, index) {
  const token = tokens[index];
  if (token === '--effort' || token === '--model') {
    const value = tokens[index + 1];
    if (value === undefined || value.startsWith('-')) throw new Error(`${token} requires a value`);
    return { kind: token.slice(2), normalized: `${token}=${value}`, nextIndex: index + 1 };
  }
  if (token.startsWith('--effort=')) return { kind: 'effort', normalized: token, nextIndex: index };
  if (token.startsWith('--model=')) return { kind: 'model', normalized: token, nextIndex: index };
  return undefined;
}
