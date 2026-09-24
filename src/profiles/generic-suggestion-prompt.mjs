import { createProfilePrompt } from "../prompts/builders.mjs";
import { globalReviewInstructions } from "../prompts/policy/review-guidance.mjs";
import { createSuggestionTool } from "../prompts/suggestion-tool.mjs";

export function createGenericSuggestionPrompt(profile) {
  const focus = `suggest actionable improvements across all supplied source categories for the ${profile} profile. Do not report existing issues; return suggestions only.`;
  return createProfilePrompt(focus, createSuggestionTool(), { globalReviewInstructions });
}
