import { createProfilePrompt, globalReviewInstructions } from "./prompt/sources.mjs";
import { createSuggestionTool } from "./suggestion-tool.mjs";

export function createGenericSuggestionPrompt(profile) {
  const focus = `suggest actionable improvements across all supplied source categories for the ${profile} profile. Do not report existing issues. Return suggestions only.`;
  return createProfilePrompt(focus, createSuggestionTool(), { globalReviewInstructions });
}
