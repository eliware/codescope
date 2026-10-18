import { readPrompt } from "./read-content.mjs";
import { createReviewTool } from "../review-tool.mjs";

export function createReviewPromptSources(profilePrompt) {
  const reviewTool = createReviewTool();
  const defaultPrompt = profilePrompt(readPrompt("profile-review.md"), reviewTool);
  const refactorPrompt = profilePrompt(readPrompt("profile-refactor.md"), reviewTool);
  return {
    sources: {
      conventions: profilePrompt(
        `${readPrompt("policy-conventions.md")}\n\n${readPrompt("conventions-extra.md")}`,
      ),
      refactor: refactorPrompt,
    },
    defaultPrompt,
  };
}
