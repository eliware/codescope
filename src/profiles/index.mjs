import { createReviewTool, createSuggestionTool, SUGGESTION_CATEGORIES } from '../prompt.mjs';
import { getProfileFiles } from './metadata.mjs';
import { getPromptRouting } from './prompt-routing.mjs';
import { createProfileCombiner } from './source-selection.mjs';
export { PROFILE_NAMES } from './metadata.mjs';

export function getProfile(profile, mode = 'review') {
  const profileFiles = getProfileFiles(profile);
  if (!['review', 'suggest'].includes(mode)) throw new Error(`Unknown profile mode: ${mode}`);
  const [, tests] = profileFiles;
  const reviewSources = mode === 'review';
  const combine = createProfileCombiner(profileFiles, mode);

  const { promptSource, suggestionCategories } = getPromptRouting(profile, mode);
  const prompt = structuredClone(promptSource);
  if (mode === 'suggest') {
    const categories = [
      ...new Set([...(suggestionCategories ?? SUGGESTION_CATEGORIES), 'new-features']),
    ];
    const tool = createSuggestionTool(categories);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  } else if (suggestionCategories) {
    const tool = createReviewTool(suggestionCategories);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  }
  return { combine, prompt, includesTests: reviewSources || tests };
}
