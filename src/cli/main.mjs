import { runReview } from '../review/lifecycle.mjs';
import { getProfile } from '../profiles/index.mjs';
import { EXIT_CODES, errorExitCode } from './errors.mjs';
import { parseArgs } from './args.mjs';
import { dispatchMeta } from './dispatch-meta.mjs';
import { statusForPromptResult, statusForReviewResult } from './status-result.mjs';

export async function main(
  args,
  {
    output = console.log,
    error = console.error,
    write = process.stdout.write.bind(process.stdout),
    cwd = process.cwd(),
    review = runReview,
  } = {},
) {
  try {
    const {
      command,
      mode = 'review',
      option,
      options = [],
      testTimeout,
      effort,
      model,
      dryRun,
      promptText,
    } = parseArgs(args);
    if (dispatchMeta(command, option, output)) return EXIT_CODES.PASS;
    if (command === 'prompt') {
      const { combine, prompt: profilePrompt } = getProfile('all', 'review');
      const prompt = structuredClone(profilePrompt);
      if (effort) {
        prompt.reasoning ??= {};
        prompt.reasoning.effort = effort;
      }
      const result = await review(cwd, {
        combine,
        prompt,
        plainText: promptText,
        model,
        write,
      });
      return statusForPromptResult(result);
    }
    const target = command.slice('analyze-'.length);
    const effectiveMode = target === 'new-features' && mode === 'review' ? 'suggest' : mode;
    const { combine, prompt: profilePrompt, includesTests } = getProfile(target, effectiveMode);
    const prompt = structuredClone(profilePrompt);
    const reviewOptions = {
      write,
      combine,
      usage: option === '--usage' || options.includes('--usage'),
      prompt,
      includesTests,
      omitTestResults: option === '--omit-test-results' || options.includes('--omit-test-results'),
      model,
      dryRun,
    };
    if (testTimeout) reviewOptions.testTimeoutMs = Number(testTimeout) * 1000;
    if (effort) {
      reviewOptions.prompt.reasoning ??= {};
      reviewOptions.prompt.reasoning.effort = effort;
    }
    const result = await review(cwd, reviewOptions);
    if (dryRun) return EXIT_CODES.PASS;
    const isSuggestion = mode === 'suggest' || target === 'new-features';
    return statusForReviewResult(result, { isSuggestion, isValid: true });
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command'))
      error('Run "codescope --help" for usage.');
    return errorExitCode(cause);
  }
}
