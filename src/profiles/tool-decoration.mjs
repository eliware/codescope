import { createReviewTool } from '../prompts/review-tool.mjs';
import { createSuggestionTool } from '../prompts/suggestion-tool.mjs';
import { SUGGESTION_CATEGORIES } from '../prompts/categories.mjs';

export function decorateProfilePrompt(promptSource, mode, suggestionCategories) {
  const prompt = structuredClone(promptSource);
  if (mode === 'suggest') {
    const categories = [
      ...new Set([...(suggestionCategories ?? SUGGESTION_CATEGORIES), 'new-features']),
    ];
    const tool = createSuggestionTool(categories);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  } else if (suggestionCategories) {
    const tool = createReviewTool(suggestionCategories);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  }
  return prompt;
}
