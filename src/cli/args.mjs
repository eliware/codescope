import { PROFILE_NAMES } from '../profiles/index.mjs';
import { parsePromptArgs } from './prompt-args.mjs';

export function parseArgs(args) {
  // codescope ignore: grouped review/suggest commands intentionally share one concise option grammar; direct profiles retain their legacy aliases.
  const [first = 'help', ...rest] = args;
  if (first === 'prompt') return parsePromptArgs(rest);
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
