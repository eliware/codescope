export function createReviewProfiles({ profilePrompt, reviewTool }) {
  return {
    prompt: profilePrompt("review selected source files for actionable implementation issues."),
    refactorPrompt: profilePrompt(
      "Identify meaningful monolithic-file responsibility splits and suggest smaller single-purpose structures. Return concise suggestions with paths and line number(s). Do not report ordinary implementation issues, style preferences, or intentional policies.",
    ),
    reviewTool,
  };
}
