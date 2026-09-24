import { parsePromptArgs } from "../prompt-args.mjs";
import { parseGroupedArgs } from "../grouped-args.mjs";
import { parseDirectCommandArgs } from "./direct-command.mjs";

export function parseCommandArgs(args) {
  const [first = "help", ...rest] = args;
  if (first === "prompt") return parsePromptArgs(rest);
  if (first === "review" || first === "suggest") return parseGroupedArgs(first, rest);
  return parseDirectCommandArgs(first, rest);
}
