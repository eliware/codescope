import { getProfileFiles } from './metadata.mjs';
import { getPromptRouting } from './prompt-routing.mjs';
import { createProfileCombiner } from './source-selection.mjs';
import { decorateProfilePrompt } from './tool-decoration.mjs';
export { PROFILE_NAMES } from './metadata.mjs';

export function getProfile(profile, mode = 'review') {
  const profileFiles = getProfileFiles(profile);
  if (!['review', 'suggest'].includes(mode)) throw new Error(`Unknown profile mode: ${mode}`);
  const [, tests] = profileFiles;
  const reviewSources = mode === 'review';
  const combine = createProfileCombiner(profileFiles, mode);
  const { promptSource, suggestionCategories } = getPromptRouting(profile, mode);
  const prompt = decorateProfilePrompt(promptSource, mode, suggestionCategories);
  return { combine, prompt, includesTests: reviewSources || tests };
}
