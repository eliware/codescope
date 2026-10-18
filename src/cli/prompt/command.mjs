import { getProfile } from "../../profiles/index.mjs";
import { applyEffort } from "./options.mjs";

export async function runPromptCommand({
  cwd,
  write,
  review,
  promptText,
  model,
  effort,
  add = [],
  debugRequest,
}) {
  const { combine, prompt: profilePrompt } = getProfile("all", "review");
  const prompt = applyEffort(profilePrompt, effort);
  await review(cwd, { combine, prompt, plainText: promptText, model, write, add, debugRequest });
  return 0;
}
