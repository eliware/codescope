import { createAnalysisProfiles } from "../../prompts/analysis-profiles.mjs";
import { createReviewTool } from "../../prompts/review-tool.mjs";

export function createAnalysisPromptSources(profilePrompt) {
  const { priorityPrompt, analysisPrompt } = createAnalysisProfiles({
    profilePrompt,
    createReviewTool,
  });
  return {
    createAnalysisPrompt: analysisPrompt,
    sources: {
      p0: priorityPrompt(0),
      "p0-1": priorityPrompt(1),
      "p0-2": priorityPrompt(2),
      "p0-3": priorityPrompt(3),
    },
  };
}
