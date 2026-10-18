import { parseOptionValues } from "../options/parse-values.mjs";
import { parseCommandArgs } from "./command.mjs";
import { mergeCommandOptions } from "./merge-options.mjs";

const plainTextCommands = new Set(["analyze-conventions", "analyze-refactor"]);

export function parseArgs(args) {
  const values = parseOptionValues(args, { leadingOnly: true });
  const command =
    values.consumed > 0
      ? mergeCommandOptions(parseCommandArgs(values.remaining), values)
      : parseCommandArgs(args);
  if (plainTextCommands.has(command.command) && (command.usage || command.dryRun))
    throw new Error("Options --usage and --dry-run are not valid for plain-text commands");
  return command;
}
