import { validateEffort, validateModel } from './option-validation.mjs';
import { parseTimeoutOption } from './timeout-options.mjs';

export { parseTimeoutOption } from './timeout-options.mjs';
export { validateEffort, validateModel } from './option-validation.mjs';

export function parseOptionValues(tokens) {
  const effortTokens = tokens.filter((value) => value.startsWith('--effort='));
  const modelTokens = tokens.filter((value) => value.startsWith('--model='));
  const dryRunTokens = tokens.filter((value) => value === '--dry-run');
  if (effortTokens.length > 1) throw new Error('Only one --effort option is allowed');
  if (modelTokens.length > 1) throw new Error('Only one --model option is allowed');
  if (dryRunTokens.length > 1) throw new Error('Only one --dry-run option is allowed');
  const effort = effortTokens[0]?.slice('--effort='.length);
  const model = modelTokens[0]?.slice('--model='.length);
  validateEffort(effort);
  validateModel(model);
  return {
    effort,
    model,
    dryRun: dryRunTokens.length > 0,
    remaining: tokens.filter(
      (value) =>
        !value.startsWith('--effort=') && !value.startsWith('--model=') && value !== '--dry-run',
    ),
  };
}

export function parseCommandOptions(tokens, usage, allowed, rejectVersion = false) {
  const values = parseOptionValues(tokens);
  const timeout = parseTimeoutOption(values.remaining, usage);
  if (rejectVersion && ['--version', '-v'].includes(timeout.remaining[0]))
    throw new Error(`Option ${timeout.remaining[0]} is not valid for this command`);
  if (new Set(timeout.remaining).size !== timeout.remaining.length) throw new Error(usage);
  if (
    timeout.remaining.length > 1 ||
    (timeout.remaining.length === 1 && !allowed.has(timeout.remaining[0]))
  )
    throw new Error(usage);
  return { ...values, ...timeout };
}
