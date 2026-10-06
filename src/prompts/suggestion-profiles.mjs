import { createImplementationOnlyPrompt } from "./suggestions.mjs";

export function createSuggestionProfiles({ profilePrompt, suggestionTool }) {
  const implementationOnlyPrompt = (instruction) =>
    createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool });
  return {
    architecturePrompt: implementationOnlyPrompt("Suggest architecture optimizations only."),
    newFeaturesPrompt: implementationOnlyPrompt(
      "Suggest new features only. Do not report bugs, risks, quality issues, refactoring, missing tests, or documentation problems. Do not assign P0, P1, or P2 priorities. For each suggestion, state its user value and likely code area.",
    ),
    securityPrompt: implementationOnlyPrompt("Identify security risks only."),
    performancePrompt: implementationOnlyPrompt("Identify performance risks only."),
    reliabilityPrompt: implementationOnlyPrompt("Identify reliability risks only."),
    apiDesignPrompt: implementationOnlyPrompt("Suggest API design improvements only."),
    dependenciesPrompt: implementationOnlyPrompt("Suggest dependency improvements only."),
    observabilityPrompt: implementationOnlyPrompt("Suggest observability improvements only."),
    accessibilityPrompt: implementationOnlyPrompt(
      "Suggest accessibility improvements for user-facing behavior only.",
    ),
    quickWinsPrompt: implementationOnlyPrompt("Suggest only high-value, low-effort improvements."),
    prioritizePrompt: implementationOnlyPrompt("Rank existing improvement opportunities only."),
  };
}
