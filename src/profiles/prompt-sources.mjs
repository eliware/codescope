import { createProfilePrompt } from '../prompts/builders.mjs';
import { globalReviewInstructions } from '../prompts/policy/review-guidance.mjs';
import { createAllPrompt } from '../prompts/all.mjs';
import { createCombinedAllPrompt } from '../prompts/combined.mjs';
import { createUnifiedTool } from '../prompts/unified-tool.mjs';
import { createAnalysisProfiles } from '../prompts/analysis-profiles.mjs';
import { createReviewProfiles } from '../prompts/review-profiles.mjs';
import { createSuggestionProfiles } from '../prompts/suggestion-profiles.mjs';
import { createConventionPrompt } from '../prompts/conventions.mjs';
import { createReviewTool } from '../prompts/review-tool.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
const profilePrompt = (focus, tool = createReviewTool()) =>
  createProfilePrompt(focus, tool, { globalReviewInstructions });
const { priorityPrompt, analysisPrompt: createAnalysisPrompt } =
  createAnalysisProfiles({ profilePrompt, createReviewTool });
const reviewProfiles = createReviewProfiles({ profilePrompt, reviewTool: createReviewTool() });
const { refactorPrompt, prompt: defaultPrompt } = reviewProfiles;
const { architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt } =
  createSuggestionProfiles({ profilePrompt, suggestionTool: createSuggestionTool() });
const conventionsPrompt = createConventionPrompt(profilePrompt);
const allPrompt = createAllPrompt(profilePrompt);
const combinedAllPrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool() });
const releasePrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool(), releaseGate: true });

const promptSources = Object.freeze({
  conventions: conventionsPrompt,
  refactor: refactorPrompt,
  architecture: architecturePrompt,
  'new-features': newFeaturesPrompt,
  security: securityPrompt,
  performance: performancePrompt,
  reliability: reliabilityPrompt,
  'api-design': apiDesignPrompt,
  dependencies: dependenciesPrompt,
  observability: observabilityPrompt,
  accessibility: accessibilityPrompt,
  'quick-wins': quickWinsPrompt,
  prioritize: prioritizePrompt,
  p0: priorityPrompt(0),
  'p0-1': priorityPrompt(1),
  'p0-2': priorityPrompt(2),
  'p0-3': priorityPrompt(3),
});

export function getPromptSource(profile) {
  return promptSources[profile];
}

export function createGenericSuggestionPrompt(profile) {
  return profilePrompt(
    `suggest actionable improvements across all supplied source categories for the ${profile} profile. Do not report existing issues; return suggestions only.`,
    createSuggestionTool(),
  );
}

export { createAnalysisPrompt, releasePrompt, combinedAllPrompt, defaultPrompt };
