import { fillPrompt } from "./read-content.mjs";
import { createReviewTool } from "../review-tool.mjs";

export function createAnalysisPromptSources(profilePrompt) {
  const priorityPrompt = (maximum) =>
    profilePrompt(fillPrompt("priority.md", { MAXIMUM: maximum }), createReviewTool());
  const analysisPrompt = (subject) =>
    profilePrompt(fillPrompt("analysis.md", { SUBJECT: subject }));
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
