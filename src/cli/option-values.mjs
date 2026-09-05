const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
const MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'];

export function parseOptionValues(tokens) {
  const effortTokens = tokens.filter((value) => value.startsWith('--effort='));
  const modelTokens = tokens.filter((value) => value.startsWith('--model='));
  const dryRunTokens = tokens.filter((value) => value === '--dry-run');
  if (effortTokens.length > 1) throw new Error('Only one --effort option is allowed');
  if (modelTokens.length > 1) throw new Error('Only one --model option is allowed');
  if (dryRunTokens.length > 1) throw new Error('Only one --dry-run option is allowed');
  const effort = effortTokens[0]?.slice('--effort='.length);
  const model = modelTokens[0]?.slice('--model='.length);
  if (effort && !EFFORTS.includes(effort))
    throw new Error(`Effort must be one of: ${EFFORTS.join(', ')}`);
  if (model && !MODELS.includes(model))
    throw new Error(`Model must be one of: ${MODELS.join(', ')}`);
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

export function parseTimeoutOption(
  tokens,
  usage = 'Usage: codescope review|suggest <profile> [options]',
) {
  const indexes = tokens.flatMap((value, index) => (value === '--test-timeout' ? [index] : []));
  if (indexes.length > 1) throw new Error('Only one --test-timeout option is allowed');
  if (!indexes.length) return { remaining: tokens, testTimeout: undefined };
  const index = indexes[0];
  const testTimeout = tokens[index + 1];
  if (!/^\d+$/u.test(testTimeout ?? '') || Number(testTimeout) < 1) throw new Error(usage);
  return {
    testTimeout,
    remaining: tokens.filter((_, itemIndex) => itemIndex !== index && itemIndex !== index + 1),
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
