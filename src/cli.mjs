import { runReview } from './review.mjs';
import { getProfile, PROFILE_NAMES } from './cli-profiles.mjs';
import { fs } from '@eliware/common';
import { isValidReviewResult, isValidSuggestionResult } from './review-response.mjs';

const VERSION = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

export const EXIT_CODES = Object.freeze({
  PASS: 0,
  BLOCKED: 1,
  USAGE: 2,
  CONFIGURATION: 3,
  INPUT: 4,
  API: 5,
  RESPONSE: 6,
  TEST_TIMEOUT: 124,
  SIGINT: 130,
  SIGTERM: 143,
});

const errorText = (cause) => {
  const messages = [];
  for (let current = cause; current; current = current.cause) {
    if (current instanceof Error || typeof current?.message === 'string')
      messages.push(current.message);
  }
  return messages.join(' ');
};

export function errorExitCode(cause) {
  const text = errorText(cause);
  if (cause?.code === 'API') return EXIT_CODES.API;
  if (cause?.code === 'INVALID_RESPONSE') return EXIT_CODES.RESPONSE;
  if (/SIGINT|signal interrupt|AbortError/u.test(text)) return EXIT_CODES.SIGINT;
  if (/SIGTERM|signal termination/u.test(text)) return EXIT_CODES.SIGTERM;
  if (cause?.code === 'ETIMEDOUT' || /timed out/u.test(text)) return EXIT_CODES.TEST_TIMEOUT;
  if (
    /Usage:|Unknown command|Unknown option|Unexpected arguments|Effort must be|not valid for/u.test(
      text,
    )
  )
    return EXIT_CODES.USAGE;
  if (/OPENAI_API_TOKEN|\.codescope|environment variable/u.test(text))
    return EXIT_CODES.CONFIGURATION;
  if (/Unable to (read|inspect)|ENOENT|input file|source file/u.test(text)) return EXIT_CODES.INPUT;
  if (
    /Invalid (review|suggestion|combined|tool|function) response|verdict|category array/u.test(text)
  )
    return EXIT_CODES.RESPONSE;
  if (/OpenAI|API request|initialize OpenAI|authentication/u.test(text)) return EXIT_CODES.API;
  return EXIT_CODES.INPUT;
}

export function usage() {
  return fs.readFileSync(new URL('../docs/quick-start.md', import.meta.url), 'utf8');
}

export function parseArgs(args) {
  // codescope ignore: grouped review/suggest commands intentionally share one concise option grammar; direct profiles retain their legacy aliases.
  const [first = 'help', ...rest] = args;
  const effortTokens = rest.filter((value) => value.startsWith('--effort='));
  if (effortTokens.length > 1) throw new Error('Only one --effort option is allowed');
  const effortToken = effortTokens[0];
  const effort = effortToken?.slice('--effort='.length);
  const modelTokens = rest.filter((value) => value.startsWith('--model='));
  if (modelTokens.length > 1) throw new Error('Only one --model option is allowed');
  const modelToken = modelTokens[0];
  const model = modelToken?.slice('--model='.length);
  const dryRunTokens = rest.filter((value) => value === '--dry-run');
  if (dryRunTokens.length > 1) throw new Error('Only one --dry-run option is allowed');
  const argsWithoutEffort = rest.filter(
    (value) =>
      !value.startsWith('--effort=') && !value.startsWith('--model=') && value !== '--dry-run',
  );
  if (effortToken && !['none', 'low', 'medium', 'high', 'xhigh', 'max'].includes(effort))
    throw new Error('Effort must be one of: none, low, medium, high, xhigh, max');
  if (modelToken && !['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'].includes(model))
    throw new Error('Model must be one of: gpt-5.6-luna, gpt-5.6-terra, gpt-5.6-sol');
  if (first === 'review' || first === 'suggest') {
    const [profile, ...options] = argsWithoutEffort;
    if (rest[0] === '--dry-run') throw new Error('Profile must precede options');
    if (!profile) throw new Error('Usage: codescope review|suggest <profile> [options]');
    if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command profile: ${profile}`);
    if (first === 'review' && profile === 'new-features')
      throw new Error('new-features is suggestion-only; use suggest new-features');
    const timeoutIndex = options.indexOf('--test-timeout');
    if (options.filter((value) => value === '--test-timeout').length > 1)
      throw new Error('Only one --test-timeout option is allowed');
    const timeout = timeoutIndex >= 0 ? options[timeoutIndex + 1] : undefined;
    const remaining = options.filter(
      (_, index) => timeoutIndex < 0 || (index !== timeoutIndex && index !== timeoutIndex + 1),
    );
    // codescope ignore: grouped dry-run is removed before shared option validation and preserved on the returned parse result.
    if (
      !profile ||
      (timeoutIndex >= 0 && (!/^\d+$/u.test(timeout ?? '') || Number(timeout) < 1)) ||
      remaining.some(
        (value) => !['--usage', '--help', '-h', '--omit-test-results'].includes(value),
      ) ||
      new Set(remaining).size !== remaining.length
    )
      throw new Error('Usage: codescope review|suggest <profile> [options]');
    return {
      command: `analyze-${profile}`,
      mode: first,
      option: remaining[0],
      options: remaining,
      testTimeout: timeout,
      effort,
      model,
      ...(dryRunTokens.length ? { dryRun: true } : {}),
    };
  }
  const option = argsWithoutEffort[0];

  if (['-h', '--help'].includes(first)) {
    if (argsWithoutEffort.length)
      throw new Error(`Unexpected arguments: ${argsWithoutEffort.join(' ')}`);
    return { command: 'help', option: undefined };
  }
  if (first === 'help' && argsWithoutEffort.length === 1 && ['--help', '-h'].includes(option))
    return { command: 'help', option, effort };
  if (first === 'help' && argsWithoutEffort.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for help`);
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  if (['-v', '--version'].includes(first)) {
    if (argsWithoutEffort.length)
      throw new Error(`Unexpected arguments: ${argsWithoutEffort.join(' ')}`);
    return { command: 'version', option: undefined };
  }
  if (first === 'version' && argsWithoutEffort.length === 1 && ['--version', '-v'].includes(option))
    return { command: 'version', option, effort };
  if (first === 'version' && argsWithoutEffort.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for version`);
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  const profiles = [
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'all',
  ];
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  const commandNames = new Set(['help', 'version', ...profiles]);
  if (!commandNames.has(first)) throw new Error(`Unknown command: ${first}`);
  if (profiles.includes(first) && ['--version', '-v'].includes(option))
    throw new Error(`Option ${option} is not valid for ${first}`);
  const validOptions = new Set([
    '--help',
    '-h',
    '--version',
    '-v',
    '--usage',
    '--omit-test-results',
    '--test-timeout',
  ]);
  if (
    argsWithoutEffort.length > 2 ||
    (argsWithoutEffort.length === 1 && option === '--test-timeout') ||
    (argsWithoutEffort.length === 2 &&
      (option !== '--test-timeout' ||
        !/^\d+$/u.test(argsWithoutEffort[1]) ||
        Number(argsWithoutEffort[1]) < 1)) ||
    (argsWithoutEffort.length === 1 && !validOptions.has(option))
  ) {
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }

  return {
    command: first === 'help' || first === 'version' ? first : `analyze-${first}`,
    option,
    testTimeout: option === '--test-timeout' ? argsWithoutEffort[1] : undefined,
    effort,
    model,
    ...(dryRunTokens.length ? { dryRun: true } : {}),
  };
}

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

export { VERSION };
