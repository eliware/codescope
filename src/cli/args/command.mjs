import { parsePromptArgs } from '../prompt-args.mjs';
import { parseOptionValues } from '../options/parse-values.mjs';
import { parseGroupedArgs } from '../grouped-args.mjs';
import { parseProfileArgs } from '../profile-args.mjs';
import { parseMetaCommand } from '../meta-args.mjs';

export function parseCommandArgs(args) {
  const [first = 'help', ...rest] = args;
  if (first === 'prompt') return parsePromptArgs(rest);
  if (first === 'review' || first === 'suggest') return parseGroupedArgs(first, rest);
  const values = parseOptionValues(rest);
  const metaTokens = values.remaining.filter((token) => !['--usage', '--dry-run'].includes(token));
  const meta = parseMetaCommand(first, metaTokens);
  if (meta)
    return {
      ...meta,
      effort: values.effort,
      model: values.model,
      ...(values.dryRun ? { dryRun: true } : {}),
      ...(values.usage ? { usage: true } : {}),
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
