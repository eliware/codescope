import { createReviewProfiles } from '../review-profiles.mjs';
import { reviewTool } from '../review-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';

export const reviewProfiles = createReviewProfiles({ profilePrompt, reviewTool });
export { profilePrompt };
export const { prompt, mdPrompt, refactorPrompt, codeTestsDocsPrompt } = reviewProfiles;
