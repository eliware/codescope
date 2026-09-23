import { reviewTool } from './review-tool.mjs';
import { defaultDeveloperText, profileReviewRules } from './guidance.mjs';
import { baseRequest } from './request-envelope.mjs';

export function createProfilePrompt(focus, tool = reviewTool, { globalReviewInstructions = '' } = {}) {
  return {
    ...baseRequest,
    tools: [tool],
    tool_choice: { type: 'function', name: tool.name },
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `${globalReviewInstructions}\n\n${profileReviewRules}\n\nProfile focus: ${focus}`,
          },
        ],
      },
    ],
  };
}
