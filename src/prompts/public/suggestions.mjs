import { createSuggestionProfiles } from '../suggestion-profiles.mjs';
import { suggestionTool } from '../suggestion-tool.mjs';
import { profilePrompt } from './profile-prompt.mjs';

export const suggestionProfiles = createSuggestionProfiles({ profilePrompt, suggestionTool });
export const {
  architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt,
  reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt,
  accessibilityPrompt, quickWinsPrompt, prioritizePrompt,
} = suggestionProfiles;
