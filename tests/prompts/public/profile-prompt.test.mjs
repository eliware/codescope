import { profilePrompt } from '../../../src/prompts/public/profile-prompt.mjs';

test('creates a profile prompt from focus text', () => {
  expect(profilePrompt('review this')).toEqual(expect.any(Object));
});
