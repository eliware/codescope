import { validateEffort, validateModel } from './option-validation.mjs';

export function partitionPromptArgs(args) {
  const delimiter = args.indexOf('--');
  const isOption = (value) => {
    if (['--dry-run', '--usage'].includes(value)) return true;
    if (value.startsWith('--effort=')) {
      try { validateEffort(value.slice('--effort='.length)); return true; } catch { return false; }
    }
    if (value.startsWith('--model=')) {
      try { validateModel(value.slice('--model='.length)); return true; } catch { return false; }
    }
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
