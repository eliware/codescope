function normalizeScalar(value, prefix) {
  const scalar = Array.isArray(value) ? value[0] : value;
  return scalar?.startsWith(prefix) ? scalar.slice(prefix.length) : scalar;
}

export function normalizeCommand(command, values, extras = {}) {
  return {
    ...command,
    ...extras,
    effort: normalizeScalar(values.effort, '--effort='),
    model: normalizeScalar(values.model, '--model='),
    ...(values.dryRun ? { dryRun: true } : {}),
    ...(values.usage ? { usage: true } : {}),
    add: values.add,
  };
}
