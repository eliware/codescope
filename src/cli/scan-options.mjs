export function scanOptionTokens(tokens, { keepScalarOptions = false } = {}) {
  const add = [];
  const remaining = [];
  const effort = [];
  const model = [];
  let dryRun = 0;
  let usage = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '-a' || token === '--add') {
      const value = tokens[++index];
      if (value === undefined || value.startsWith('-')) throw new Error(`${token} requires a value`);
      add.push(value);
    } else if (token === '--effort' || token === '--model') {
      const value = tokens[++index];
      if (value === undefined || value.startsWith('-')) throw new Error(`${token} requires a value`);
      const normalized = `${token}=${value}`;
      (token === '--effort' ? effort : model).push(normalized);
      if (keepScalarOptions) remaining.push(normalized);
    } else if (token.startsWith('--effort=')) {
      effort.push(token);
      if (keepScalarOptions) remaining.push(token);
    } else if (token.startsWith('--model=')) {
      model.push(token);
      if (keepScalarOptions) remaining.push(token);
    } else if (token === '--dry-run') {
      dryRun += 1;
      if (keepScalarOptions) remaining.push(token);
    } else if (token === '--usage') {
      usage += 1;
      remaining.push(token);
    } else remaining.push(token);
  }
  return { add, effort, model, dryRun, usage, remaining };
}
