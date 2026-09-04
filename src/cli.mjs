import { runReview } from './review.mjs';
import { getProfile } from './cli-profiles.mjs';
import { isValidReviewResult, isValidSuggestionResult } from './review-response.mjs';
import { EXIT_CODES, errorExitCode } from './cli/errors.mjs';
import { VERSION } from './cli/version.mjs';
import { usage } from './cli/help.mjs';
import { parseArgs } from './cli/args.mjs';
export { usage } from './cli/help.mjs';
export { parseArgs } from './cli/args.mjs';
export { EXIT_CODES, errorExitCode } from './cli/errors.mjs';
export { VERSION } from './cli/version.mjs';


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
  // codescope ignore: main intentionally owns dispatch, option forwarding, response validation, and exit-code mapping as the public CLI contract.
  // codescope ignore: runReview and main intentionally validate at separate collaborator and public-CLI boundaries.
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
    if (option && ['--help', '-h'].includes(option)) {
      output(usage());
      return 0;
    }
    if (option === '--version' || option === '-v') {
      output(VERSION);
      return 0;
    }
    if (command === 'help') {
      output(usage());
      return 0;
    }
    if (command === 'version') {
      output(VERSION);
      return 0;
    }
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
      return typeof result?.text === 'string' ? EXIT_CODES.PASS : EXIT_CODES.RESPONSE;
    }
    const target = command.slice('analyze-'.length);
    const effectiveMode = target === 'new-features' && mode === 'review' ? 'suggest' : mode;
    const { combine, prompt: profilePrompt, includesTests } = getProfile(target, effectiveMode);
    const prompt = structuredClone(profilePrompt);
    if (option === '--omit-test-results' && !includesTests)
      throw new Error(`Option --omit-test-results is not valid for ${target}`);
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
    const isCombined = target === 'all' && mode === 'review';
    const effectivePrompt = reviewOptions.prompt;
    const suggestionResultIsValid = isValidSuggestionResult(result, effectivePrompt);
    if (
      (!isSuggestion &&
        (isCombined ? !isValidReviewResult({ issues: result?.issues, verdict: result?.verdict }, { tools: [effectivePrompt.tools[0]] }) || !isValidSuggestionResult({ suggestions: result?.suggestions }, { tools: [effectivePrompt.tools[1]] }) : !isValidReviewResult(result, effectivePrompt))) ||
      (isSuggestion && !suggestionResultIsValid)
    ) {
      error('codescope: review returned no validated pass-or-block verdict');
      return EXIT_CODES.RESPONSE;
    }
    if (isSuggestion) return EXIT_CODES.PASS;
    return result.verdict === 'block' ? EXIT_CODES.BLOCKED : EXIT_CODES.PASS;
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command'))
      error('Run "codescope --help" for usage.');
    return errorExitCode(cause);
  }
}
