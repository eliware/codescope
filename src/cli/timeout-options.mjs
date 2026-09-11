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
