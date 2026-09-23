import { createReviewProfiles } from '../review-profiles.mjs';
import { reviewTool } from '../review-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';

const reviewProfiles = createReviewProfiles({ profilePrompt, reviewTool });

export const { prompt, mdPrompt, refactorPrompt, codeTestsDocsPrompt } = reviewProfiles;
