import { createReviewProfiles } from "../../prompts/review-profiles.mjs";
import { createConventionPrompt } from "../../prompts/conventions.mjs";
import { createReviewTool } from "../../prompts/review-tool.mjs";

export function createReviewPromptSources(profilePrompt) {
  const { refactorPrompt, prompt: defaultPrompt } = createReviewProfiles({
    profilePrompt,
    reviewTool: createReviewTool(),
  });
  return {
    sources: {
      conventions: createConventionPrompt(profilePrompt),
      refactor: refactorPrompt,
    },
    defaultPrompt,
  };
}
