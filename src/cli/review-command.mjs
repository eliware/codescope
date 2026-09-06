import { getProfile } from '../profiles/index.mjs';
import { statusForPromptResult, statusForReviewResult } from './status-result.mjs';

export async function runReviewCommand(
  command,
  {
    mode = 'review',
    option,
    options = [],
    testTimeout,
    effort,
    model,
    dryRun,
    promptText,
    cwd,
    write,
    review,
  },
) {
  if (command === 'prompt') {
    const { combine, prompt: profilePrompt } = getProfile('all', 'review');
    const prompt = structuredClone(profilePrompt);
    applyEffort(prompt, effort);
    const result = await review(cwd, { combine, prompt, plainText: promptText, model, write });
    return statusForPromptResult(result);
  }
  const target = command.slice('analyze-'.length);
  const effectiveMode = target === 'new-features' && mode === 'review' ? 'suggest' : mode;
  const { combine, prompt: profilePrompt, includesTests } = getProfile(target, effectiveMode);
  const prompt = structuredClone(profilePrompt);
  applyEffort(prompt, effort);
  const result = await review(cwd, {
    write,
    combine,
    usage: option === '--usage' || options.includes('--usage'),
    prompt,
    includesTests,
    omitTestResults: option === '--omit-test-results' || options.includes('--omit-test-results'),
    model,
    dryRun,
    ...(testTimeout ? { testTimeoutMs: Number(testTimeout) * 1000 } : {}),
  });
  if (dryRun) return 0;
  return statusForReviewResult(result, {
    isSuggestion: mode === 'suggest' || target === 'new-features',
  });
}

function applyEffort(prompt, effort) {
  if (!effort) return;
  prompt.reasoning ??= {};
  prompt.reasoning.effort = effort;
}
