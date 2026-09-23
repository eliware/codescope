import { refactorPrompt } from '../prompts/public/review-profiles.mjs';
import { allPrompt } from '../prompts/public/unified-review.mjs';
import { releasePrompt } from '../prompts/public/release-review.mjs';
import { conventionsPrompt } from '../prompts/public/convention-review.mjs';
import {
  architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt,
} from '../prompts/public/suggestions.mjs';
import { priorityPrompt } from '../prompts/public/analysis.mjs';

export const profileRegistry = {
  conventions: conventionsPrompt, all: allPrompt, release: releasePrompt, refactor: refactorPrompt,
  architecture: architecturePrompt, 'new-features': newFeaturesPrompt, security: securityPrompt,
  performance: performancePrompt, reliability: reliabilityPrompt, 'api-design': apiDesignPrompt,
  dependencies: dependenciesPrompt, observability: observabilityPrompt, accessibility: accessibilityPrompt,
  'quick-wins': quickWinsPrompt, prioritize: prioritizePrompt,
  p0: priorityPrompt(0), 'p0-1': priorityPrompt(1), 'p0-2': priorityPrompt(2), 'p0-3': priorityPrompt(3),
};
