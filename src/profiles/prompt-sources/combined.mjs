import { readPrompt } from "./read-content.mjs";
import { createUnifiedTool } from "../unified-tool.mjs";

export function createCombinedPromptSources(profilePrompt) {
  const combinedProfilePrompt = (focus, tool) =>
    profilePrompt(focus, tool, { globalReviewInstructions: "" });
  const allPrompt = combinedProfilePrompt(readPrompt("all.md"));
  const buildPrompt = (file) => {
    const prompt = structuredClone(allPrompt);
    prompt.tools = [createUnifiedTool()];
    prompt.tool_choice = "auto";
    prompt.input.push({
      role: "user",
      content: [{ type: "input_text", text: readPrompt(file) }],
    });
    return prompt;
  };
  const combinedAllPrompt = buildPrompt("combined-all.md");
  const releasePrompt = buildPrompt("combined-release.md");
  return { combinedAllPrompt, releasePrompt };
}
