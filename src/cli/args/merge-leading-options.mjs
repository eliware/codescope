export function mergeLeadingOptions(parsed, values) {
  if (values.effort !== undefined && parsed.effort !== undefined)
    throw new Error('Only one --effort option is allowed');
  if (values.model !== undefined && parsed.model !== undefined)
    throw new Error('Only one --model option is allowed');
  if (values.dryRun && parsed.dryRun)
    throw new Error('Only one --dry-run option is allowed');
  if (values.usageCount + (parsed.usage ? 1 : 0) > 1)
    throw new Error('Only one --usage option is allowed');
  if (parsed.command === 'prompt' && values.dryRun)
    throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
  return {
    ...parsed,
    effort: values.effort ?? parsed.effort,
    model: values.model ?? parsed.model,
    ...(values.dryRun || parsed.dryRun ? { dryRun: true } : {}),
    usage: values.usageCount > 0 || parsed.usage || undefined,
    add: values.add,
  };
}
