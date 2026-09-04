import { createAnalysisPrompt, createPriorityPrompt } from './priority.mjs';

export function createAnalysisProfiles({ profilePrompt, createReviewTool }) {
  return {
    priorityPrompt: (maximum) => createPriorityPrompt(maximum, { profilePrompt, createReviewTool }),
    analysisPrompt: (subject) => createAnalysisPrompt(subject, { profilePrompt }),
  };
}
