import {
  profilePrompt,
  allPrompt,
  combinedAllPrompt,
  refactorPrompt,
  releasePrompt,
  conventionsPrompt,
} from '../prompts/public/review.mjs';
import { createAnalysisPrompt, priorityPrompt } from '../prompts/public/analysis.mjs';
import {
  architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt,
} from '../prompts/public/suggestions.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
import { REVIEW_CATEGORIES } from '../prompts/categories.mjs';

const prompts = {
  conventions: conventionsPrompt,
  all: allPrompt,
  release: releasePrompt,
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

const suggestionCategories = {
  refactor: ['architecture'],
  architecture: ['architecture'],
  'new-features': ['new-features'],
  tests: ['tests'],
  security: ['security'],
  performance: ['performance'],
  reliability: ['reliability'],
  'api-design': ['api_design'],
  'cross-platform': ['cross_platform'],
  dependencies: ['reliability'],
  observability: ['reliability'],
  accessibility: ['correctness'],
  'quick-wins': REVIEW_CATEGORIES,
  prioritize: REVIEW_CATEGORIES,
};

export function getPromptRouting(profile, mode) {
  if (!Object.hasOwn(prompts, profile) && !Object.hasOwn(suggestionCategories, profile))
    throw new Error(`Unknown analysis profile: ${profile}`);
  const categories = suggestionCategories[profile];
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
            : (prompts[profile] ??
              createAnalysisPrompt(
                'the supplied implementation, test, and documentation files for actionable implementation issues',
              ));
  return { promptSource, suggestionCategories: categories };
}
