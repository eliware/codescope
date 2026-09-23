import { prompt, profilePrompt } from '../../../src/prompts/public/review-profiles.mjs';

test('exports review profile construction', () => {
  expect(profilePrompt).toEqual(expect.any(Function));
  expect(prompt).toEqual(expect.any(Object));
});
