import { createCombinedAllPrompt } from '../combined.mjs';
import { createUnifiedTool } from '../unified-tool.mjs';
import { allPrompt } from './unified-review.mjs';

export const releasePrompt = createCombinedAllPrompt({ allPrompt, unifiedTool: createUnifiedTool(), releaseGate: true });
