import { PROFILE_NAMES } from '../profiles/index.mjs';
import { parseCommandOptions } from './option-values.mjs';

const validOptions = new Set(['--help', '-h', '--version', '-v', '--usage']);

export function parseProfileArgs(profile, tokens) {
  const usage = `Unexpected arguments: ${tokens.join(' ')}`;
  const values = parseCommandOptions(tokens, usage, validOptions, true);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command: ${profile}`);
  return {
    command: `analyze-${profile}`,
    option: values.remaining[0],
    effort: values.effort,
    model: values.model,
    add: values.add,
    ...(values.dryRun ? { dryRun: true } : {}),
  };
}
