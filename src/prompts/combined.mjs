import { combinedCompletenessGuidance } from "./policy/combined-completeness.mjs";
import { combinedResponseContract } from "./policy/combined-response-contract.mjs";
import { combinedReviewGuidance } from "./policy/combined-review-guidance.mjs";

function appendReviewGuidance(message) {
  if (message.role !== "user") return message;
  return {
    ...message,
    content: message.content.map((part) => ({
      ...part,
      text: `${part.text}\n${combinedReviewGuidance}`,
    })),
  };
}

export function createCombinedAllPrompt({ allPrompt, unifiedTool, releaseGate = false }) {
  return {
    ...allPrompt,
    tools: [unifiedTool],
    tool_choice: { type: "function", name: unifiedTool.name },
    input: [
      ...allPrompt.input.map(appendReviewGuidance),
      {
        role: "user",
        content: [{ type: "input_text", text: combinedCompletenessGuidance(releaseGate) }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: combinedResponseContract }],
      },
    ],
  };
}
