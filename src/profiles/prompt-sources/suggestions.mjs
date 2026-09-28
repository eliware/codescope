import { createSuggestionProfiles } from "../../prompts/suggestion-profiles.mjs";
import { createSuggestionTool } from "../../prompts/suggestion-tool.mjs";

export function createSuggestionPromptSources(profilePrompt) {
  const profiles = createSuggestionProfiles({
    profilePrompt,
    suggestionTool: createSuggestionTool(),
  });
  return {
    architecture: profiles.architecturePrompt,
    "new-features": profiles.newFeaturesPrompt,
    security: profiles.securityPrompt,
    performance: profiles.performancePrompt,
    reliability: profiles.reliabilityPrompt,
    "api-design": profiles.apiDesignPrompt,
    dependencies: profiles.dependenciesPrompt,
    observability: profiles.observabilityPrompt,
    accessibility: profiles.accessibilityPrompt,
    "quick-wins": profiles.quickWinsPrompt,
    prioritize: profiles.prioritizePrompt,
  };
}
