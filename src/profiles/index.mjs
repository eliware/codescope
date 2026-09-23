import { getProfileFiles } from './profile-definitions.mjs';
import { getPromptRouting } from './prompt-routing.mjs';
import { createProfileCombiner } from './source-selection.mjs';
import { decorateProfilePrompt } from './tool-decoration.mjs';
export function getProfile(profile, mode = 'review') {
  const profileFiles = getProfileFiles(profile);
  if (!['review', 'suggest'].includes(mode)) throw new Error(`Unknown profile mode: ${mode}`);
  const combine = createProfileCombiner(profileFiles, mode);
  const { promptSource, suggestionCategories } = getPromptRouting(profile, mode);
  const prompt = decorateProfilePrompt(promptSource, mode, suggestionCategories);
  return { combine, prompt };
}
