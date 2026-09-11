import { validateEffort, validateModel } from './option-values.mjs';

export function parsePromptArgs(args) {
  const delimiter = args.indexOf('--');
  const promptArgs = delimiter < 0 ? args : args.slice(0, delimiter);
  const optionArgs = delimiter < 0 ? [] : args.slice(delimiter + 1);
  const promptText = promptArgs
    .filter((value) => delimiter >= 0 || !value.startsWith('--'))
    .join(' ')
    .trim();
  if (!promptText) throw new Error('Usage: codescope prompt <prompt text>');
  const options = delimiter < 0 ? promptArgs.filter((value) => value.startsWith('--')) : optionArgs;
  const effortToken = options.find((value) => value.startsWith('--effort='));
  const modelToken = options.find((value) => value.startsWith('--model='));
  if (options.filter((value) => value.startsWith('--effort=')).length > 1)
    throw new Error('Only one --effort option is allowed');
  if (options.filter((value) => value.startsWith('--model=')).length > 1)
    throw new Error('Only one --model option is allowed');
  const allowed = options.filter(
    (value) => value.startsWith('--effort=') || value.startsWith('--model='),
  );
  if (options.length !== allowed.length || new Set(options).size !== options.length)
    throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
  const effort = effortToken?.slice('--effort='.length);
  const model = modelToken?.slice('--model='.length);
  validateEffort(effort);
  validateModel(model);
  return { command: 'prompt', promptText, effort, model };
}
