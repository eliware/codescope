import { PROFILE_NAMES } from '../profiles/index.mjs';
import { parseOptionValues, parseTimeoutOption } from './option-values.mjs';

const validOptions = new Set(['--help', '-h', '--version', '-v', '--usage', '--omit-test-results']);

export function parseProfileArgs(profile, tokens) {
  const values = parseOptionValues(tokens);
  const timeout = parseTimeoutOption(values.remaining, `Unexpected arguments: ${tokens.join(' ')}`);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command: ${profile}`);
  if (['--version', '-v'].includes(timeout.remaining[0]))
    throw new Error(`Option ${timeout.remaining[0]} is not valid for ${profile}`);
  if (
    timeout.remaining.length > 1 ||
    (timeout.remaining.length === 1 && !validOptions.has(timeout.remaining[0]))
  )
    throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
  return {
    command: `analyze-${profile}`,
    option: timeout.remaining[0],
    testTimeout: timeout.testTimeout,
    effort: values.effort,
    model: values.model,
    ...(values.dryRun ? { dryRun: true } : {}),
  };
}
