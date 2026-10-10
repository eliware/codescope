import { parseOptionValues } from "../options/parse-values.mjs";
import { parseProfileArgs } from "../profile-args.mjs";
import { parseMetaCommand } from "../meta-args.mjs";
import { normalizeCommand } from "./normalize-command.mjs";

export function parseDirectCommandArgs(first, rest) {
  // codescope ignore this because option values are consumed before metadata argument checks.
  const values = parseOptionValues(rest);
  const metaTokens = values.remaining.filter(
    (token) => !["--usage", "--dry-run", "--debug-request"].includes(token),
  );
  const meta = parseMetaCommand(first, metaTokens);
  if (meta) {
    if (values.usage) throw new Error("--usage is not supported for help or version commands");
    return normalizeCommand(meta, values);
  }
  if (first.startsWith("-")) throw new Error(`Unknown option: ${first}`);
  return normalizeCommand(parseProfileArgs(first, values.remaining), values);
}
