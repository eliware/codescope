import { validateEffort, validateModel } from '../option-validation.mjs';
import { scanOptionStream } from './scan-option-stream.mjs';

export function parseOptionValues(tokens, options) {
  const values = scanOptionStream(tokens, options);
  const { effort: effortTokens, model: modelTokens, dryRun: dryRunCount, usage: usageTokenCount } = values;
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
    ...(usageTokenCount > 0 ? { usage: true } : {}),
    add: values.add,
    remaining: values.remaining,
    ...(options?.leadingOnly ? { consumed: values.consumed } : {}),
    ...(options?.leadingOnly ? { usageCount: usageTokenCount } : {}),
  };
}
