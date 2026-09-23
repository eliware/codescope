import { createAnalysisProfiles } from '../analysis-profiles.mjs';
import { createReviewTool } from '../review-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';

export const { priorityPrompt, analysisPrompt: createAnalysisPrompt } =
  createAnalysisProfiles({ profilePrompt, createReviewTool });
