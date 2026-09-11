import { getProfile } from '../profiles/index.mjs';
import { statusForReviewResult } from './status-result.mjs';
import { applyEffort } from './prompt-options.mjs';

export async function runProfileCommand(command, options) {
  const target = command.slice('analyze-'.length);
  const {
    mode = 'review',
    option,
    options: rawOptions = [],
    testTimeout,
    effort,
    model,
    dryRun,
    cwd,
    write,
    review,
  } = options;
  const effectiveMode = target === 'new-features' && mode === 'review' ? 'suggest' : mode;
  const { combine, prompt: profilePrompt, includesTests } = getProfile(target, effectiveMode);
  const prompt = applyEffort(profilePrompt, effort);
  const result = await review(cwd, {
    write,
    combine,
    usage: option === '--usage' || rawOptions.includes('--usage'),
    prompt,
    includesTests,
    omitTestResults: option === '--omit-test-results' || rawOptions.includes('--omit-test-results'),
    model,
    dryRun,
    ...(testTimeout ? { testTimeoutMs: Number(testTimeout) * 1000 } : {}),
  });
  if (dryRun) return 0;
  return statusForReviewResult(result, {
    isSuggestion: mode === 'suggest' || target === 'new-features',
  });
}
