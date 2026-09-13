import { parseOptionValues } from './option-values.mjs';
import { parseAddOptions } from './add-option.mjs';

export function parsePromptArgs(args) {
  const additions = parseAddOptions(args);
  args = additions.remaining;
  const delimiter = args.indexOf('--');
  const promptArgs = delimiter < 0 ? args.filter((value) => !value.startsWith('--')) : args.slice(0, delimiter);
  const optionArgs = delimiter < 0 ? args.filter((value) => value.startsWith('--')) : args.slice(delimiter + 1);
  const promptText = promptArgs.join(' ').trim();
  if (!promptText) throw new Error('Usage: codescope prompt <prompt text>');
  const values = parseOptionValues(optionArgs);
  if (values.remaining.length > 0 || values.dryRun)
    throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
  return {
    command: 'prompt',
    promptText,
    effort: values.effort,
    model: values.model,
    add: additions.add,
  };
}
