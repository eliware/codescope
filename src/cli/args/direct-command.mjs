import { parseOptionValues } from "../options/parse-values.mjs";
import { parseProfileArgs } from "../profile-args.mjs";
import { parseMetaCommand } from "../meta-args.mjs";
import { normalizeCommand } from "./normalize-command.mjs";

export function parseDirectCommandArgs(first, rest) {
  const values = parseOptionValues(rest);
  // This filter only serves metadata parsing; profile parsing preserves values.debugRequest below.
  const metaTokens = values.remaining.filter(
    (token) => !["--usage", "--dry-run", "--debug-request"].includes(token),
  );
  const meta = parseMetaCommand(first, metaTokens);
  if (meta) {
    if (values.usage) throw new Error("--usage is not supported for help or version commands");
    // Help and version output accept additions and provider flags but do not apply them.
    return normalizeCommand(meta, values);
  }
  if (first.startsWith("-")) throw new Error(`Unknown option: ${first}`);
  return normalizeCommand(parseProfileArgs(first, values.remaining), values);
}
