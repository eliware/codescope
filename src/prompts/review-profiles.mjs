export function createReviewProfiles({ profilePrompt, reviewTool }) {
  return {
    prompt: profilePrompt('review selected source files for actionable implementation issues.'),
    mdPrompt: profilePrompt(
      'Find documentation inconsistencies only. Report each inconsistency with its Markdown path and line number(s). Do not report standalone code issues or style preferences.',
    ),
    codeTestsDocsPrompt: profilePrompt(
      'Find conflicts between documentation and code only. Report each conflict with the relevant path and line number(s). Do not report standalone code or documentation issues.',
    ),
    refactorPrompt: profilePrompt(
      'Identify meaningful monolithic-file responsibility splits and suggest smaller single-purpose structures. Return concise suggestions with paths and line number(s). Do not report ordinary implementation issues, style preferences, or intentional policies.',
    ),
    reviewTool,
  };
}
