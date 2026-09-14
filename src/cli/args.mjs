import { parsePromptArgs } from './prompt-args.mjs';
import { parseOptionValues } from './option-values.mjs';
import { parseGroupedArgs } from './grouped-args.mjs';
import { parseProfileArgs } from './profile-args.mjs';
import { parseMetaCommand } from './meta-args.mjs';
import { scanOptionTokens } from './scan-options.mjs';

export function parseArgs(args) {
  const values = parseOptionValues(args, { leadingOnly: true });
  const parsed = values.consumed > 0
    ? mergeLeadingOptions(parseCommandArgs(values.remaining), values)
    : parseCommandArgs(args);
  return { ...parsed, add: scanOptionTokens(args).add };
}

function parseCommandArgs(args) {
  const [first = 'help', ...rest] = args;
  if (first === 'prompt') return parsePromptArgs(rest);
  if (first === 'review' || first === 'suggest') return parseGroupedArgs(first, rest);
  const values = parseOptionValues(rest);
  const metaTokens = values.remaining.filter((token) => !['--usage', '--dry-run'].includes(token));
  const meta = parseMetaCommand(first, metaTokens);
  if (meta)
    return {
      ...meta,
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

function mergeLeadingOptions(parsed, values) {
  if (parsed.command === 'help' || parsed.command === 'version')
    return { ...parsed, add: [...values.add, ...parsed.add] };
  if (values.effort !== undefined && parsed.effort !== undefined)
    throw new Error('Only one --effort option is allowed');
  if (values.model !== undefined && parsed.model !== undefined)
    throw new Error('Only one --model option is allowed');
  if (values.dryRun && parsed.dryRun)
    throw new Error('Only one --dry-run option is allowed');
  if (values.usageCount + (parsed.usage ? 1 : 0) > 1)
    throw new Error('Only one --usage option is allowed');
  if (parsed.command === 'prompt' && values.dryRun)
    throw new Error('Usage: codescope prompt <prompt text> [--effort=...] [--model=...]');
  return {
    ...parsed,
    effort: values.effort ?? parsed.effort,
    model: values.model ?? parsed.model,
    ...(values.dryRun || parsed.dryRun ? { dryRun: true } : {}),
    usage: values.usageCount > 0 || parsed.usage || undefined,
    add: [...values.add, ...parsed.add],
  };
}
