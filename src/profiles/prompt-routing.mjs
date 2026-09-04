import {
  createAnalysisPrompt, profilePrompt, allPrompt, combinedAllPrompt, refactorPrompt, architecturePrompt,
  newFeaturesPrompt, securityPrompt, performancePrompt, reliabilityPrompt, apiDesignPrompt, dependenciesPrompt,
  observabilityPrompt, accessibilityPrompt, quickWinsPrompt, prioritizePrompt, priorityPrompt, createSuggestionTool,
  REVIEW_CATEGORIES,
} from '../prompt.mjs';

const prompts = {
  all: allPrompt, refactor: refactorPrompt, architecture: architecturePrompt, 'new-features': newFeaturesPrompt,
  security: securityPrompt, performance: performancePrompt, reliability: reliabilityPrompt, 'api-design': apiDesignPrompt,
  dependencies: dependenciesPrompt, observability: observabilityPrompt, accessibility: accessibilityPrompt,
  'quick-wins': quickWinsPrompt, prioritize: prioritizePrompt, p0: priorityPrompt(0), 'p0-1': priorityPrompt(1),
  'p0-2': priorityPrompt(2), 'p0-3': priorityPrompt(3),
};

const suggestionCategories = {
  refactor: ['architecture'], architecture: ['architecture'], 'new-features': ['new-features'], tests: ['tests'],
  security: ['security'], performance: ['performance'], reliability: ['reliability'], 'api-design': ['api_design'],
  'cross-platform': ['cross_platform'], dependencies: ['reliability'], observability: ['reliability'], accessibility: ['correctness'],
  'quick-wins': REVIEW_CATEGORIES, prioritize: REVIEW_CATEGORIES,
};

export function getPromptRouting(profile, mode) {
  const categories = suggestionCategories[profile];
  const promptSource = profile === 'all' && mode === 'review'
    ? combinedAllPrompt
    : mode === 'suggest' && !categories
      ? profilePrompt(`suggest actionable improvements across all supplied source categories for the ${profile} profile. Do not report existing issues; return suggestions only.`, createSuggestionTool())
      : mode === 'review' && categories
        ? createAnalysisPrompt(`the selected code for ${profile} issues only`)
        : prompts[profile] ?? createAnalysisPrompt('the supplied implementation, test, and documentation files for actionable implementation issues');
  return { promptSource, suggestionCategories: categories };
}
