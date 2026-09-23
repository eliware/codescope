import { reviewTool } from '../review-tool.mjs';
import { createProfilePrompt } from '../builders.mjs';
import { globalReviewInstructions } from '../policy.mjs';

export const profilePrompt = (focus, tool = reviewTool) =>
  createProfilePrompt(focus, tool, { globalReviewInstructions });
