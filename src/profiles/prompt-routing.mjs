import { profilePrompt } from '../prompts/public/profile-prompt.mjs';
import { combinedAllPrompt } from '../prompts/public/unified-review.mjs';
import { releasePrompt } from '../prompts/public/release-review.mjs';
import { createAnalysisPrompt } from '../prompts/public/analysis.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
import {
  architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt,
} from '../prompts/public/suggestions.mjs';
import { refactorPrompt } from '../prompts/public/focused-review-profiles.mjs';
import { conventionsPrompt } from '../prompts/public/convention-review.mjs';
import { priorityPrompt } from '../prompts/public/analysis.mjs';
import { PROFILE_DEFINITIONS, getSuggestionCategories } from './profile-definitions.mjs';

const promptSources = {
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
};

export function getPromptRouting(profile, mode) {
  if (!Object.hasOwn(PROFILE_DEFINITIONS, profile))
    throw new Error(`Unknown analysis profile: ${profile}`);
  const categories = getSuggestionCategories(profile);
  const promptSource =
    profile === 'all' && mode === 'review'
      ? combinedAllPrompt
      : profile === 'release' && mode === 'review'
        ? releasePrompt
        : mode === 'suggest' && !categories
          ? profilePrompt(
              `suggest actionable improvements across all supplied source categories for the ${profile} profile. Do not report existing issues; return suggestions only.`,
              createSuggestionTool(),
            )
          : mode === 'review' && categories
            ? createAnalysisPrompt(`the selected code for ${profile} issues only`)
            : (promptSources[profile] ??
              createAnalysisPrompt(
                'the supplied implementation, test, and documentation files for actionable implementation issues',
              ));
  return { promptSource, suggestionCategories: categories };
}
