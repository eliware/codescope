import { createReviewTool } from "./review-tool.mjs";
import { createSuggestionTool } from "./suggestion-tool.mjs";
import { SUGGESTION_CATEGORIES } from "./categories.mjs";

export const webSearchTool = {
  type: "web_search",
  user_location: { type: "approximate" },
  search_context_size: "medium",
};

export function decorateProfilePrompt(promptSource, mode, suggestionCategories, webSearch = false) {
  const prompt = structuredClone(promptSource);
  prompt.tools = [
    ...(webSearch ? [webSearchTool] : []),
    ...(prompt.tools ?? []).filter((tool) => tool.type !== "web_search"),
  ];
  prompt.include = (prompt.include ?? []).filter(
    (item) => item !== "web_search_call.action.sources",
  );
  if (webSearch) prompt.include.push("web_search_call.action.sources");
  if (mode === "suggest") {
    const categories = [
      ...new Set([...(suggestionCategories ?? SUGGESTION_CATEGORIES), "new-features"]),
    ];
    const tool = createSuggestionTool(categories);
    prompt.tools = [...(webSearch ? [webSearchTool] : []), tool];
    prompt.tool_choice = "auto";
  } else if (suggestionCategories) {
    const tool = createReviewTool(suggestionCategories);
    prompt.tools = [...(webSearch ? [webSearchTool] : []), tool];
    prompt.tool_choice = "auto";
  }
  return prompt;
}
