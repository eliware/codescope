import { validatePromptShape } from "../prompt-shape.mjs";

export function validatePromptRequest({ plainText, usage, dryRun, prompt }) {
  if (plainText !== undefined && (dryRun || usage))
    throw new Error("runReview option plainText cannot be combined with dryRun or usage");
  if (prompt !== undefined) validatePromptShape(prompt);
}
