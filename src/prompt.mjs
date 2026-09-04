import {
  createReviewTool,
  createUnifiedTool,
  reviewTool,
  suggestionTool,
} from './prompts/tool-schemas.mjs';
import { createSuggestionProfiles } from './prompts/suggestion-profiles.mjs';
import { createAnalysisProfiles } from './prompts/analysis-profiles.mjs';
import { createCombinedAllPrompt } from './prompts/combined.mjs';
import { createAllPrompt } from './prompts/all.mjs';
import { createReviewProfiles } from './prompts/review-profiles.mjs';
import { createProfilePrompt } from './prompts/builders.mjs';

export { REVIEW_CATEGORIES, SUGGESTION_CATEGORIES } from './prompts/categories.mjs';
export {
  createReviewTool,
  reviewTool,
  createSuggestionTool,
  createUnifiedTool,
  suggestionTool,
} from './prompts/tool-schemas.mjs';

export { defaultDeveloperText } from './prompts/guidance.mjs';
import { globalReviewInstructions } from './prompts/policy.mjs';

export const profilePrompt = (focus, tool = reviewTool) =>
  createProfilePrompt(focus, tool, { globalReviewInstructions });
const reviewProfiles = createReviewProfiles({ profilePrompt, reviewTool });
export const { prompt, mdPrompt } = reviewProfiles;
export const allPrompt = createAllPrompt(profilePrompt);
export const combinedAllPrompt = createCombinedAllPrompt({
  allPrompt,
  unifiedTool: createUnifiedTool(),
});
export const releasePrompt = createCombinedAllPrompt({
  allPrompt,
  unifiedTool: createUnifiedTool(),
  releaseGate: true,
});
export const { codeTestsDocsPrompt, refactorPrompt } = reviewProfiles;
export const {
  architecturePrompt,
  newFeaturesPrompt,
  securityPrompt,
  performancePrompt,
  reliabilityPrompt,
  apiDesignPrompt,
  dependenciesPrompt,
  observabilityPrompt,
  accessibilityPrompt,
  quickWinsPrompt,
  prioritizePrompt,
} = createSuggestionProfiles({ profilePrompt, suggestionTool });
export const { priorityPrompt, analysisPrompt: createAnalysisPrompt } = createAnalysisProfiles({
  profilePrompt,
  createReviewTool,
});
