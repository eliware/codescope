import { parsePromptArgs } from './prompt-args.mjs';
import { parseOptionValues } from './option-values.mjs';
import { parseGroupedArgs } from './grouped-args.mjs';
import { parseProfileArgs } from './profile-args.mjs';
import { parseMetaCommand } from './meta-args.mjs';

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
