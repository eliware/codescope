import { architecturePrompt, suggestionProfiles } from '../../../src/prompts/public/suggestions.mjs';

test('exports suggestion prompt family', () => {
  expect(architecturePrompt).toEqual(expect.any(Object));
  expect(suggestionProfiles).toHaveProperty('securityPrompt');
});
