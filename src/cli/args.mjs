import { parseOptionValues } from './options/parse-values.mjs';
import { parseCommandArgs } from './args/command.mjs';
import { mergeLeadingOptions } from './args/merge-leading-options.mjs';

export function parseArgs(args) {
  const values = parseOptionValues(args, { leadingOnly: true });
  const parsed = values.consumed > 0
    ? mergeLeadingOptions(parseCommandArgs(values.remaining), values)
    : parseCommandArgs(args);
  return parsed;
}
