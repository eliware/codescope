import { getProfile } from '../profiles/index.mjs';
import { applyEffort } from './prompt-options.mjs';

export async function runProfileCommand(command, options) {
  const target = command.slice('analyze-'.length);
  const {
    mode = 'review',
    option,
    options: rawOptions = [],
    effort,
    model,
    dryRun,
    cwd,
    write,
    review,
    add = [],
  } = options;
  const effectiveMode = target === 'new-features' && mode === 'review' ? 'suggest' : mode;
  const { combine, prompt: profilePrompt } = getProfile(target, effectiveMode);
  const prompt = applyEffort(profilePrompt, effort);
  await review(cwd, {
    write,
    combine,
    usage: option === '--usage' || rawOptions.includes('--usage'),
    prompt,
    model,
    dryRun,
    add,
  });
  if (dryRun) return 0;
  return 0;
}
