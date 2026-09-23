import { createConventionPrompt } from '../conventions.mjs';
import { profilePrompt } from './profile-prompt.mjs';

export const conventionsPrompt = createConventionPrompt(profilePrompt);
