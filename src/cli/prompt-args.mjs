import { parseOptionValues } from './options/parse-values.mjs';
import { scanOptionStream } from './options/scan-option-stream.mjs';
import { partitionPromptArgs } from './prompt-partition.mjs';

export function parsePromptArgs(args) {
  const additions = scanOptionStream(args, { keepScalarOptions: true });
  args = additions.remaining;
  const { promptArgs, optionArgs } = partitionPromptArgs(args);
  const promptText = promptArgs.join(' ').trim();
  if (!promptText) throw new Error('Usage: codescope prompt <prompt text>');
  const values = parseOptionValues(optionArgs);
  if (values.remaining.length > 0 || values.dryRun || values.usage)
    throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
  return {
    command: 'prompt',
    promptText,
    effort: values.effort,
    model: values.model,
    add: additions.add,
  };
}
