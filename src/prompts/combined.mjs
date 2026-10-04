import { combinedCompletenessGuidance } from "./policy/combined-completeness.mjs";

export function createCombinedAllPrompt({ allPrompt, unifiedTool, releaseGate = false }) {
  return {
    ...allPrompt,
    tools: [unifiedTool],
    tool_choice: { type: "function", name: unifiedTool.name },
    input: [
      ...allPrompt.input,
      {
        role: "user",
        content: [{ type: "input_text", text: combinedCompletenessGuidance(releaseGate) }],
      },
    ],
  };
}
