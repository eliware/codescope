const HELP = ['-h', '--help'];
const VERSION = ['-v', '--version'];

export function parseMetaCommand(first, tokens) {
  const option = tokens[0];
  if (HELP.includes(first)) {
    if (tokens.length) throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
    return { command: 'help', option: undefined };
  }
  if (first === 'help' && !tokens.length) return { command: 'help', option: undefined };
  if (first === 'help' && tokens.length === 1 && HELP.includes(option))
    return { command: 'help', option };
  if (first === 'help' && tokens.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for help`);
    throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
  }
  if (VERSION.includes(first)) {
    if (tokens.length) throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
    return { command: 'version', option: undefined };
  }
  if (first === 'version' && !tokens.length) return { command: 'version', option: undefined };
  if (first === 'version' && tokens.length === 1 && VERSION.includes(option))
    return { command: 'version', option };
  if (first === 'version' && tokens.length) {
    if (option.startsWith('-')) throw new Error(`Option ${option} is not valid for version`);
    throw new Error(`Unexpected arguments: ${tokens.join(' ')}`);
  }
  return undefined;
}
