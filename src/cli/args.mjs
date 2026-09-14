import { parsePromptArgs } from './prompt-args.mjs';
import { parseOptionValues } from './option-values.mjs';
import { parseGroupedArgs } from './grouped-args.mjs';
import { parseProfileArgs } from './profile-args.mjs';
import { parseMetaCommand } from './meta-args.mjs';

export function parseArgs(args) {
  const leading = takeLeadingScalarOptions(args);
  if (leading.options.length) {
    const values = parseOptionValues(leading.options);
    const parsed = parseArgs(leading.remaining);
    if (values.effort !== undefined && parsed.effort !== undefined)
      throw new Error('Only one --effort option is allowed');
    if (values.model !== undefined && parsed.model !== undefined)
      throw new Error('Only one --model option is allowed');
    if (values.dryRun && parsed.dryRun)
      throw new Error('Only one --dry-run option is allowed');
    if (parsed.command === 'prompt' && values.dryRun)
      throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
    return {
      ...parsed,
      effort: values.effort ?? parsed.effort,
      model: values.model ?? parsed.model,
      ...(values.dryRun || parsed.dryRun ? { dryRun: true } : {}),
    };
  }
  const [first = 'help', ...rest] = args;
  if (first === 'prompt') return parsePromptArgs(rest);
  if (first === 'review' || first === 'suggest') return parseGroupedArgs(first, rest);
  const values = parseOptionValues(rest);
  const meta = parseMetaCommand(first, values.remaining);
  if (meta)
    return {
      ...meta,
      effort: values.effort,
      model: values.model,
      add: values.add,
    };
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  return {
    ...parseProfileArgs(first, values.remaining),
    effort: values.effort,
    model: values.model,
    ...(values.dryRun ? { dryRun: true } : {}),
    add: values.add,
  };
}

function takeLeadingScalarOptions(args) {
  let index = 0;
  while (
    index < args.length &&
    (args[index].startsWith('--effort=') ||
      args[index].startsWith('--model=') ||
      args[index] === '--dry-run')
  )
    index += 1;
  return { options: args.slice(0, index), remaining: args.slice(index) };
}
