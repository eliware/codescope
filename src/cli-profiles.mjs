import { combineSelectedFiles } from './combine-all.mjs';
import {
  createReviewTool,
  createSuggestionTool,
  SUGGESTION_CATEGORIES,
} from './prompt.mjs';
import { getProfileFiles } from './profiles/metadata.mjs';
import { getPromptRouting } from './profiles/prompt-routing.mjs';
export { PROFILE_NAMES } from './profiles/metadata.mjs';

export function getProfile(profile, mode = 'review') {
  const profileFiles = getProfileFiles(profile);
  if (!['review', 'suggest'].includes(mode)) throw new Error(`Unknown profile mode: ${mode}`);
  const [implementation, tests, docs] = profileFiles;
  const reviewSources = mode === 'review';
  const combine = (root, options) =>
    combineSelectedFiles(root, {
      ...options,
      implementation: reviewSources || implementation,
      tests: reviewSources || tests,
      docs: reviewSources || docs,
    });

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
    // codescope ignore: review all intentionally keeps both review tools and auto selection so one request can return issues and suggestions; every other review profile is single-tool.
  }
  return { combine, prompt, includesTests: reviewSources || tests };
}
