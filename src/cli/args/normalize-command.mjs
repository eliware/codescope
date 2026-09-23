export function normalizeCommand(command, values, extras = {}) {
  return {
    ...command,
    ...extras,
    effort: values.effort,
    model: values.model,
    ...(values.dryRun ? { dryRun: true } : {}),
    ...(values.usage ? { usage: true } : {}),
    add: values.add,
  };
}
