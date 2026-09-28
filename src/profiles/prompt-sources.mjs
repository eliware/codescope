import { createProfilePrompt } from "../prompts/builders.mjs";
import { globalReviewInstructions } from "../prompts/policy/review-guidance.mjs";
import { createReviewTool } from "../prompts/review-tool.mjs";
import { createReviewPromptSources } from "./prompt-sources/review.mjs";
import { createSuggestionPromptSources } from "./prompt-sources/suggestions.mjs";
import { createAnalysisPromptSources } from "./prompt-sources/analysis.mjs";
import { createCombinedPromptSources } from "./prompt-sources/combined.mjs";

const profilePrompt = (focus, tool = createReviewTool()) =>
  createProfilePrompt(focus, tool, { globalReviewInstructions });
const review = createReviewPromptSources(profilePrompt);
const analysis = createAnalysisPromptSources(profilePrompt);
const promptSources = Object.freeze({
  ...review.sources,
  ...createSuggestionPromptSources(profilePrompt),
  ...analysis.sources,
});
const { combinedAllPrompt, releasePrompt } = createCombinedPromptSources(profilePrompt);

export function getPromptSource(profile) {
  return promptSources[profile];
}

export const createAnalysisPrompt = analysis.createAnalysisPrompt;
export const defaultPrompt = review.defaultPrompt;
export { releasePrompt, combinedAllPrompt };
