export function createReviewProfiles({ profilePrompt, reviewTool }) {
  return {
    prompt: profilePrompt(
      "Review the selected source files. Report proven, actionable code issues.",
    ),
    refactorPrompt: profilePrompt(
      "Find large files that combine separate jobs. Suggest a clear split into smaller files. Give each file path and line number. Do not report code defects, style preferences, or intentional rules.",
    ),
    reviewTool,
  };
}
