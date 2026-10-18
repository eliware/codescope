export function readAddition(tokens, index) {
  const option = tokens[index];
  const equalsForm = option.match(/^(--add|-a)=(.*)$/u);
  if (equalsForm) {
    const value = equalsForm[2];
    if (!value.trim()) throw new Error(`${equalsForm[1]} requires a value`);
    return { value, nextIndex: index };
  }

  const value = tokens[index + 1];
  if (value === undefined || !value.trim()) throw new Error(`${option} requires a value`);
  return { value, nextIndex: index + 1 };
}
