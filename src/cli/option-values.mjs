import { validateEffort, validateModel } from './option-validation.mjs';
import { scanOptionTokens } from './scan-options.mjs';
export { validateEffort, validateModel } from './option-validation.mjs';

export function parseOptionValues(tokens, options) {
  const values = scanOptionTokens(tokens, options);
  const { effort: effortTokens, model: modelTokens, dryRun: dryRunCount, usage: usageCount } = values;
  if (effortTokens.length > 1) throw new Error('Only one --effort option is allowed');
  if (modelTokens.length > 1) throw new Error('Only one --model option is allowed');
  if (dryRunCount > 1) throw new Error('Only one --dry-run option is allowed');
  const effort = effortTokens[0]?.slice('--effort='.length);
  const model = modelTokens[0]?.slice('--model='.length);
  validateEffort(effort);
  validateModel(model);
  return {
    effort,
    model,
    dryRun: dryRunCount > 0,
    ...(usageCount > 0 ? { usage: true } : {}),
    add: values.add,
    remaining: values.remaining,
    ...(options?.leadingOnly ? { consumed: values.consumed } : {}),
    ...(options?.leadingOnly ? { usageCount: values.usage } : {}),
  };
}

export function parseCommandOptions(tokens, usage, allowed, rejectVersion = false) {
  const values = parseOptionValues(tokens);
  if (rejectVersion && ['--version', '-v'].includes(values.remaining[0]))
    throw new Error(`Option ${values.remaining[0]} is not valid for this command`);
  if (new Set(values.remaining).size !== values.remaining.length) throw new Error(usage);
  if (
    values.remaining.length > 1 ||
    (values.remaining.length === 1 && !allowed.has(values.remaining[0]))
  )
    throw new Error(usage);
  return values;
}
