import { PROFILE_NAMES } from '../profiles/index.mjs';
import { parseCommandOptions, parseOptionValues } from './option-values.mjs';

export function parseGroupedArgs(mode, tokens) {
  const usage = 'Usage: codescope review|suggest <profile> [options]';
  const values = parseOptionValues(tokens);
  if (tokens[0] === '--dry-run') throw new Error('Profile must precede options');
  const [profile, ...profileTokens] = values.remaining;
  if (!profile) throw new Error(usage);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command profile: ${profile}`);
  if (mode === 'review' && profile === 'new-features')
    throw new Error('new-features is suggestion-only; use suggest new-features');
  const profileValues = parseCommandOptions(
    profileTokens,
    usage,
    new Set(['--usage', '--help', '-h']),
  );
  return {
    command: `analyze-${profile}`,
    mode,
    option: profileValues.remaining[0],
    options: profileValues.remaining,
    effort: values.effort,
    model: values.model,
    ...(values.dryRun ? { dryRun: true } : {}),
  };
}
