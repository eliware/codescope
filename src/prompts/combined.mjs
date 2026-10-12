import { combinedCompletenessGuidance } from "./policy/combined-completeness.mjs";
import { webSearchTool } from "./request-envelope.mjs";

export function createCombinedAllPrompt({ allPrompt, unifiedTool, releaseGate = false }) {
  return {
    ...allPrompt,
    tools: [webSearchTool, unifiedTool],
    tool_choice: "auto",
    input: [
      ...allPrompt.input,
      {
        role: "user",
        content: [{ type: "input_text", text: combinedCompletenessGuidance(releaseGate) }],
      },
    ],
  };
}
