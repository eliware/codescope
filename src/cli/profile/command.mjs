import { getProfile } from "../../profiles/index.mjs";
import { applyEffort } from "../prompt/options.mjs";

export async function runProfileCommand(command, options) {
  const target = command.slice("analyze-".length);
  const {
    mode = "review",
    option,
    options: rawOptions = [],
    effort,
    model,
    dryRun,
    debugRequest,
    usage = false,
    cwd,
    write,
    review,
    add = [],
  } = options;
  const { combine, prompt: profilePrompt } = getProfile(target, mode);
  const prompt = applyEffort(profilePrompt, effort);
  await review(cwd, {
    write,
    combine,
    usage: usage || option === "--usage" || rawOptions.includes("--usage"),
    prompt,
    model,
    dryRun,
    debugRequest,
    add,
  });
  if (dryRun) return 0;
  return 0;
}
