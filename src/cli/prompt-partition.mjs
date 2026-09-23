import { isPromptScalarOption } from './options/prompt-values.mjs';

export function partitionPromptArgs(args) {
  const delimiter = args.indexOf('--');
  const isOption = (value) => {
    if (['--dry-run', '--usage'].includes(value)) return true;
    if (isPromptScalarOption(value)) return true;
    return false;
  };
  const optionArgs = delimiter < 0 ? args.filter(isOption) : normalizeTrailingOptions(args.slice(delimiter + 1));
  return {
    promptArgs:
      delimiter < 0 ? args.filter((value) => !isOption(value)) : args.slice(0, delimiter),
    optionArgs,
  };
}

function normalizeTrailingOptions(tokens) {
  const options = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '--effort' || token === '--model') {
      const value = tokens[++index];
      if (value === undefined || value.startsWith('-'))
        throw new Error('Only --effort=... or --model=... may follow --');
      options.push(`${token}=${value}`);
    } else if (token.startsWith('--effort=') || token.startsWith('--model=')) {
      options.push(token);
    } else {
      throw new Error('Only --effort=... or --model=... may follow --');
    }
  }
  return options;
}
