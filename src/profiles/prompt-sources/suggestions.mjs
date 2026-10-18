import { readPrompt } from "./read-content.mjs";
import { createSuggestionTool } from "../suggestion-tool.mjs";

export function createSuggestionPromptSources(profilePrompt) {
  const suggestionTool = createSuggestionTool();
  const profile = (name) => profilePrompt(readPrompt(`suggestion-${name}.md`), suggestionTool);
  return {
    architecture: profile("architecture"),
    "new-features": profile("new-features"),
    security: profile("security"),
    performance: profile("performance"),
    reliability: profile("reliability"),
    "api-design": profile("api-design"),
    dependencies: profile("dependencies"),
    observability: profile("observability"),
    accessibility: profile("accessibility"),
    "quick-wins": profile("quick-wins"),
    prioritize: profile("prioritize"),
  };
}
