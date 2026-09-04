import { createSuggestionProfiles } from '../../src/prompts/suggestion-profiles.mjs';

test('creates the complete suggestion profile set with focused instructions', () => {
  const profiles = createSuggestionProfiles({
    profilePrompt: (focus, tool) => ({ focus, tool }),
    suggestionTool: 'suggestions',
  });
  expect(Object.keys(profiles)).toHaveLength(11);
  expect(profiles.newFeaturesPrompt.focus).toContain('Suggest new features only');
  expect(profiles.architecturePrompt.tool).toBe('suggestions');
});
