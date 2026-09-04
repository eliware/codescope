const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
const MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'];

export function parsePromptArgs(args) {
  const promptText = args.filter((value) => !value.startsWith('--')).join(' ').trim();
  if (!promptText) throw new Error('Usage: codescope prompt <prompt text>');
  const options = args.filter((value) => value.startsWith('--'));
  const effortToken = options.find((value) => value.startsWith('--effort='));
  const modelToken = options.find((value) => value.startsWith('--model='));
  const allowed = options.filter((value) => value.startsWith('--effort=') || value.startsWith('--model='));
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
