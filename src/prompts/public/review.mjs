import { createReviewProfiles } from '../review-profiles.mjs';
import { createAllPrompt } from '../all.mjs';
import { createCombinedAllPrompt } from '../combined.mjs';
import { createConventionPrompt } from '../conventions.mjs';
import { reviewTool } from '../review-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';
import { createUnifiedTool } from '../unified-tool.mjs';

const profiles = createReviewProfiles({ profilePrompt, reviewTool });
export { profilePrompt };
export const { prompt, mdPrompt, refactorPrompt, codeTestsDocsPrompt } = profiles;
export const allPrompt = createAllPrompt(profilePrompt);
export const combinedAllPrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool() });
export const releasePrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool(), releaseGate: true });
export const conventionsPrompt = createConventionPrompt(profilePrompt);
export const reviewProfiles = profiles;
