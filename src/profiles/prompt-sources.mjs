import { profilePrompt } from '../prompts/public/profile-prompt.mjs';
import { releasePrompt } from '../prompts/public/release-review.mjs';
import { createAnalysisPrompt, priorityPrompt } from '../prompts/public/analysis.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
import {
  architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt,
} from '../prompts/public/suggestions.mjs';
import { refactorPrompt } from '../prompts/public/focused-review-profiles.mjs';
import { conventionsPrompt } from '../prompts/public/convention-review.mjs';

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

export { createAnalysisPrompt, releasePrompt };
