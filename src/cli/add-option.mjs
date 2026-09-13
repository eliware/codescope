export function parseAddOptions(tokens) {
  const add = [];
  const remaining = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '-a' || token === '--add') {
      const value = tokens[++index];
      if (value === undefined || value.startsWith('-')) throw new Error(`${token} requires a value`);
      add.push(value);
    } else remaining.push(token);
  }
  return { add, remaining };
}
