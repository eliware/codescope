import { createReviewTool } from "../prompts/review-tool.mjs";
import { createSuggestionTool } from "../prompts/suggestion-tool.mjs";
import { SUGGESTION_CATEGORIES } from "../prompts/categories.mjs";
import { webSearchTool } from "../prompts/request-envelope.mjs";

export function decorateProfilePrompt(promptSource, mode, suggestionCategories) {
  const prompt = structuredClone(promptSource);
  prompt.tools = [
    webSearchTool,
    ...(prompt.tools ?? []).filter((tool) => tool.type !== "web_search"),
  ];
  if (mode === "suggest") {
    const categories = [
      ...new Set([...(suggestionCategories ?? SUGGESTION_CATEGORIES), "new-features"]),
    ];
    const tool = createSuggestionTool(categories);
    prompt.tools = [webSearchTool, tool];
    prompt.tool_choice = "auto";
  } else if (suggestionCategories) {
    const tool = createReviewTool(suggestionCategories);
    prompt.tools = [webSearchTool, tool];
    prompt.tool_choice = "auto";
  }
  return prompt;
}
