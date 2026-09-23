import { profilePrompt } from '../prompts/public/profile-prompt.mjs';
import { combinedAllPrompt } from '../prompts/public/unified-review.mjs';
import { releasePrompt } from '../prompts/public/release-review.mjs';
import { createAnalysisPrompt } from '../prompts/public/analysis.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
import { profileRegistry } from './profile-registry.mjs';
import { suggestionCategories } from './suggestion-registry.mjs';

export function getPromptRouting(profile, mode) {
  if (!Object.hasOwn(profileRegistry, profile) && !Object.hasOwn(suggestionCategories, profile))
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
            : (profileRegistry[profile] ??
              createAnalysisPrompt(
                'the supplied implementation, test, and documentation files for actionable implementation issues',
              ));
  return { promptSource, suggestionCategories: categories };
}
