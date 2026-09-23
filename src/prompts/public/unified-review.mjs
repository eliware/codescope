import { createAllPrompt } from '../all.mjs';
import { createCombinedAllPrompt } from '../combined.mjs';
import { createUnifiedTool } from '../unified-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';

export const allPrompt = createAllPrompt(profilePrompt);
export const combinedAllPrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool() });
