import { parseOptionValues } from "../options/parse-values.mjs";
import { parseCommandArgs } from "./command.mjs";
import { mergeCommandOptions } from "./merge-options.mjs";

export function parseArgs(args) {
  const values = parseOptionValues(args, { leadingOnly: true });
  return values.consumed > 0
    ? mergeCommandOptions(parseCommandArgs(values.remaining), values)
    : parseCommandArgs(args);
}
