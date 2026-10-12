import { PROFILE_NAMES } from "../profiles/profile-selection.mjs";
import { parseCommandOptions } from "./options/command-options.mjs";

const validOptions = new Set(["--help", "-h", "--version", "-v", "--usage", "--debug-request"]);

export function parseProfileArgs(profile, tokens) {
  const usage = `Unexpected arguments: ${tokens.join(" ")}`;
  const values = parseCommandOptions(tokens, usage, validOptions, true);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command: ${profile}`);
  if (profile === "new-features")
    throw new Error("new-features requires the suggest command: codescope suggest new-features");
  return {
    command: `analyze-${profile}`,
    option: values.remaining[0],
    effort: values.effort,
    model: values.model,
    ...(values.usage ? { usage: true } : {}),
    ...(values.remaining.includes("--debug-request") ? { debugRequest: true } : {}),
    add: values.add,
  };
}
