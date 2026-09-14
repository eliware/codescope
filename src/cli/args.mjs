import { parsePromptArgs } from './prompt-args.mjs';
import { parseOptionValues } from './option-values.mjs';
import { parseGroupedArgs } from './grouped-args.mjs';
import { parseProfileArgs } from './profile-args.mjs';
import { parseMetaCommand } from './meta-args.mjs';

export function parseArgs(args) {
  const leading = takeLeadingScalarOptions(args);
  if (leading.options.length) {
    const values = parseOptionValues(leading.options);
    return mergeLeadingOptions(parseCommandArgs([...leading.remaining, ...values.remaining]), values);
  }
  return parseCommandArgs(args);
}

function parseCommandArgs(args) {
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

function mergeLeadingOptions(parsed, values) {
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
    ...(values.usage || parsed.usage ? { usage: true } : {}),
    add: [...values.add, ...parsed.add],
  };
}

function takeLeadingScalarOptions(args) {
  let index = 0;
  while (index < args.length) {
    if (
      args[index] === '--dry-run' ||
      args[index] === '--usage' ||
      args[index].startsWith('--effort=') ||
      args[index].startsWith('--model=')
    ) {
      index += 1;
      continue;
    }
    if (args[index] === '-a' || args[index] === '--add') {
      if (args[index + 1] === undefined || args[index + 1].startsWith('-'))
        throw new Error(`${args[index]} requires a value`);
      index += 2;
      continue;
    }
    if (args[index] === '--effort' || args[index] === '--model') {
      if (args[index + 1] === undefined || args[index + 1].startsWith('-'))
        throw new Error(`${args[index]} requires a value`);
      index += 2;
      continue;
    }
    break;
  }
  return { options: args.slice(0, index), remaining: args.slice(index) };
}
