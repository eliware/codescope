import { fillPrompt, readPrompt } from "../prompt-sources/read-content.mjs";
import { reviewTool } from "../review-tool.mjs";
import { createReviewPromptSources } from "../prompt-sources/review.mjs";
import { createSuggestionPromptSources } from "../prompt-sources/suggestions.mjs";
import { createAnalysisPromptSources } from "../prompt-sources/analysis.mjs";
import { createCombinedPromptSources } from "../prompt-sources/combined.mjs";

const baseRequest = {
  model: "gpt-6-luna",
  service_tier: "default",
  text: { format: { type: "text" }, verbosity: "low" },
  reasoning: { effort: "none", mode: "standard", summary: "auto" },
  tools: [reviewTool],
  tool_choice: "auto",
  parallel_tool_calls: false,
  store: false,
  include: ["reasoning.encrypted_content"],
};

export const globalReviewInstructions = readPrompt("policy-global-review.md");

export function createProfilePrompt(focus, tool = reviewTool, options = {}) {
  const globalInstructions = options.globalReviewInstructions ?? globalReviewInstructions;
  return {
    ...baseRequest,
    tools: [tool],
    tool_choice: "auto",
    input: [
      {
        role: "developer",
        content: [{ type: "input_text", text: readPrompt("guidance-developer.md") }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: fillPrompt("profile-prompt.md", {
              GLOBAL_REVIEW_INSTRUCTIONS: globalInstructions,
              PROFILE_REVIEW_RULES: readPrompt("guidance-profile-rules.md"),
              FOCUS: focus,
            }),
          },
        ],
      },
    ],
  };
}

const profilePrompt = (focus, tool = reviewTool, options = {}) =>
  createProfilePrompt(focus, tool, options);

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
