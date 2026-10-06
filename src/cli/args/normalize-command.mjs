function normalizeScalar(value, prefix) {
  const scalar = Array.isArray(value) ? value[0] : value;
  return scalar?.startsWith(prefix) ? scalar.slice(prefix.length) : scalar;
}

export function normalizeCommand(command, values, extras = {}) {
  // Apply request-wide options after every command-specific parser returns.
  return {
    ...command,
    ...extras,
    effort: normalizeScalar(values.effort, "--effort="),
    model: normalizeScalar(values.model, "--model="),
    ...(values.dryRun ? { dryRun: true } : {}),
    ...(values.usage ? { usage: true } : {}),
    ...(values.debugRequest ? { debugRequest: true } : {}),
    add: values.add,
  };
}
