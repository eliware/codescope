import { createImplementationOnlyPrompt } from './suggestions.mjs';

export function createSuggestionProfiles({ profilePrompt, suggestionTool }) {
  const implementationOnlyPrompt = (instruction) =>
    createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool });
  return {
    architecturePrompt: implementationOnlyPrompt('Suggest architecture optimizations only.'),
    newFeaturesPrompt: implementationOnlyPrompt(
      'Suggest new features only. Do not report existing bugs, risks, quality issues, refactoring opportunities, missing tests, or documentation problems. Do not assign P0/P1/P2 priorities to feature suggestions. For each concise suggestion, state the user value and likely implementation area.',
    ),
    securityPrompt: implementationOnlyPrompt('Identify security risks only.'),
    performancePrompt: implementationOnlyPrompt('Identify performance risks only.'),
    reliabilityPrompt: implementationOnlyPrompt('Identify reliability risks only.'),
    apiDesignPrompt: implementationOnlyPrompt('Suggest API design improvements only.'),
    dependenciesPrompt: implementationOnlyPrompt('Suggest dependency improvements only.'),
    observabilityPrompt: implementationOnlyPrompt('Suggest observability improvements only.'),
    accessibilityPrompt: implementationOnlyPrompt(
      'Suggest accessibility improvements only for user-facing behavior.',
    ),
    quickWinsPrompt: implementationOnlyPrompt('Suggest only high-value, low-effort improvements.'),
    prioritizePrompt: implementationOnlyPrompt(
      'Prioritize existing improvement opportunities only.',
    ),
  };
}
