import { PROFILE_NAMES } from '../profiles/index.mjs';
import { parseOptionValues, parseTimeoutOption } from './option-values.mjs';

export function parseGroupedArgs(mode, tokens) {
  const values = parseOptionValues(tokens);
  if (tokens[0] === '--dry-run') throw new Error('Profile must precede options');
  const [profile, ...profileTokens] = values.remaining;
  const usage = 'Usage: codescope review|suggest <profile> [options]';
  if (!profile) throw new Error(usage);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command profile: ${profile}`);
  if (mode === 'review' && profile === 'new-features')
    throw new Error('new-features is suggestion-only; use suggest new-features');
  const timeout = parseTimeoutOption(profileTokens, usage);
  const allowed = ['--usage', '--help', '-h', '--omit-test-results'];
  if (timeout.remaining.some((value) => !allowed.includes(value))) throw new Error(usage);
  if (new Set(timeout.remaining).size !== timeout.remaining.length) throw new Error(usage);
  return {
    command: `analyze-${profile}`,
    mode,
    option: timeout.remaining[0],
    options: timeout.remaining,
    testTimeout: timeout.testTimeout,
    effort: values.effort,
    model: values.model,
    ...(values.dryRun ? { dryRun: true } : {}),
  };
}
