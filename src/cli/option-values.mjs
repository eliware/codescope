import { validateEffort, validateModel } from './option-validation.mjs';
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
