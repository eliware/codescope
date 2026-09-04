const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
const MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'];

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
  if (effort && !EFFORTS.includes(effort))
    throw new Error('Effort must be one of: none, low, medium, high, xhigh, max');
  if (model && !MODELS.includes(model))
    throw new Error('Model must be one of: gpt-5.6-luna, gpt-5.6-terra, gpt-5.6-sol');
  return { command: 'prompt', promptText, effort, model };
}
