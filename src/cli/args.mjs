import { parsePromptArgs } from './prompt-args.mjs';
import { parseOptionValues } from './option-values.mjs';
import { parseGroupedArgs } from './grouped-args.mjs';
import { parseProfileArgs } from './profile-args.mjs';

function parseMetaCommand(first, tokens) {
  const option = tokens[0];
  if (['-h', '--help'].includes(first)) {
    if (tokens.length) throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
    return { command: 'help', option: undefined };
  }
  if (first === 'help' && !tokens.length) return { command: 'help', option: undefined };
  if (first === 'help' && tokens.length === 1 && ['--help', '-h'].includes(option))
    return { command: 'help', option };
  if (first === 'help' && tokens.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for help`);
    throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
  }
  if (['-v', '--version'].includes(first)) {
    if (tokens.length) throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
    return { command: 'version', option: undefined };
  }
  if (first === 'version' && !tokens.length) return { command: 'version', option: undefined };
  if (first === 'version' && tokens.length === 1 && ['--version', '-v'].includes(option))
    return { command: 'version', option };
  if (first === 'version' && tokens.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for version`);
    throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
  }
  return undefined;
}

export function parseArgs(args) {
  const [first = 'help', ...rest] = args;
  if (first === 'prompt') return parsePromptArgs(rest);
  const values = parseOptionValues(rest);
  if (first === 'review' || first === 'suggest') return parseGroupedArgs(first, rest);
  const meta = parseMetaCommand(first, values.remaining);
  if (meta) return { ...meta, effort: values.effort, model: values.model };
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  return parseProfileArgs(first, rest);
}
