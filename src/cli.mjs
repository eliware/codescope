import { runReview } from './review.mjs';
import { getProfile } from './cli-profiles.mjs';
import { fs } from '@eliware/common';

const VERSION = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

export function usage() {
  return fs.readFileSync(new URL('../docs/quick-start.md', import.meta.url), 'utf8');
}

export function parseArgs(args) {
  const [first = 'help', ...rest] = args;
  const option = rest[0];

  if (['-h', '--help'].includes(first)) {
    if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
    return { command: 'help', option: undefined };
  }
  if (first === 'help' && rest.length === 1 && ['--help', '-h'].includes(option))
    return { command: 'help', option };
  if (first === 'help' && rest.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for help`);
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  if (['-v', '--version'].includes(first)) {
    if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
    return { command: 'version', option: undefined };
  }
  if (first === 'version' && rest.length === 1 && ['--version', '-v'].includes(option))
    return { command: 'version', option };
  if (first === 'version' && rest.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for version`);
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  const profiles = [
    'code',
    'p0',
    'p0-1',
    'p0-2',
    'p0-3',
    'architecture',
    'api-design',
    'refactor',
    'tests',
    'code-tests',
    'tests-docs',
    'docs',
    'code-docs',
    'security',
    'reliability',
    'performance',
    'dependencies',
    'observability',
    'accessibility',
    'new-features',
    'quick-wins',
    'prioritize',
    'code-tests-docs',
    'all',
    'release',
  ];
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  const commandNames = new Set(['help', 'version', ...profiles]);
  if (!commandNames.has(first)) throw new Error(`Unknown command: ${first}`);
  if (profiles.includes(first) && ['--version', '-v'].includes(option))
    throw new Error(`Option ${option} is not valid for ${first}`);
  const validOptions = new Set(['--help', '-h', '--version', '-v', '--usage']);
  if (rest.length > 1 || (rest.length === 1 && !validOptions.has(option))) {
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }

  return {
    command: first === 'help' || first === 'version' ? first : `analyze-${first}`,
    option,
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
  try {
    const { command, option } = parseArgs(args);
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
    const { combine, prompt } = getProfile(target);
    await review(cwd, { write, combine, usage: option === '--usage', prompt });
    return 0;
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command'))
      error('Run "codescope --help" for usage.');
    return 2;
  }
}

export { VERSION };
