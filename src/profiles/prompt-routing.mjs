import { PROFILE_DEFINITIONS, getSuggestionCategories } from './profile-definitions.mjs';
import { combinedAllPrompt, createAnalysisPrompt, createGenericSuggestionPrompt, getPromptSource, releasePrompt } from './prompt-sources.mjs';

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
          ? createGenericSuggestionPrompt(profile)
          : mode === 'review' && categories
            ? createAnalysisPrompt(`the selected code for ${profile} issues only`)
            : (getPromptSource(profile) ??
              createAnalysisPrompt(
                'the supplied implementation, test, and documentation files for actionable implementation issues',
              ));
  return { promptSource, suggestionCategories: categories };
}
