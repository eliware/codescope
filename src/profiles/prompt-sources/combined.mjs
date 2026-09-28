import { createAllPrompt } from "../../prompts/all.mjs";
import { createCombinedAllPrompt } from "../../prompts/combined.mjs";
import { createUnifiedTool } from "../../prompts/unified-tool.mjs";

export function createCombinedPromptSources(profilePrompt) {
  const allPrompt = createAllPrompt(profilePrompt);
  const combinedAllPrompt = createCombinedAllPrompt({
    allPrompt,
    unifiedTool: createUnifiedTool(),
  });
  const releasePrompt = createCombinedAllPrompt({
    allPrompt,
    unifiedTool: createUnifiedTool(),
    releaseGate: true,
  });
  return { combinedAllPrompt, releasePrompt };
}
