export function readAddition(tokens, index) {
  const option = tokens[index];
  const value = tokens[index + 1];
  if (value === undefined || !value.trim()) throw new Error(`${option} requires a value`);
  return { value, nextIndex: index + 1 };
}
