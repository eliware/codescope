import { reviewTool } from "./review-tool.mjs";
import { defaultDeveloperText, profileReviewRules } from "./guidance.mjs";
import { baseRequest, webSearchTool } from "./request-envelope.mjs";

export function createProfilePrompt(
  focus,
  tool = reviewTool,
  { globalReviewInstructions = "" } = {},
) {
  return {
    ...baseRequest,
    tools: [webSearchTool, tool],
    tool_choice: "auto",
    input: [
      { role: "developer", content: [{ type: "input_text", text: defaultDeveloperText }] },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `${globalReviewInstructions}\n\n${profileReviewRules}\n\nProfile focus: ${focus}`,
          },
        ],
      },
    ],
  };
}
