import { PROFILE_NAMES } from "../profiles/profile-selection.mjs";
import { parseCommandOptions } from "./options/command-options.mjs";
import { parseOptionValues } from "./options/parse-values.mjs";

export function parseGroupedArgs(mode, tokens) {
  const usage = "Usage: codescope review|suggest <profile> [options]";
  // Scan the full command first so options after the profile remain in values.
  const values = parseOptionValues(tokens);
  const [profile, ...profileTokens] = values.remaining;
  if (!profile) throw new Error(usage);
  if (!["review", "suggest"].includes(mode)) throw new Error(`Unknown profile mode: ${mode}`);
  if (!PROFILE_NAMES.includes(profile)) throw new Error(`Unknown command profile: ${profile}`);
  if (mode === "review" && profile === "new-features")
    throw new Error("new-features is suggestion-only; use suggest new-features");
  const profileValues = parseCommandOptions(
    profileTokens,
    usage,
    // These options remain valid after the profile name.
    new Set(["--usage", "--debug-request", "--help", "-h"]),
  );
  return {
    command: `analyze-${profile}`,
    mode,
    option: profileValues.remaining[0],
    options: profileValues.remaining,
    // The first scan captures shared options from either side of the profile name.
    effort: values.effort,
    model: values.model,
    ...(values.usage ? { usage: true } : {}),
    ...(profileValues.debugRequest ? { debugRequest: true } : {}),
    add: values.add,
    ...(values.dryRun ? { dryRun: true } : {}),
  };
}
