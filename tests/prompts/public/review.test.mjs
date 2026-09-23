import { allPrompt, profilePrompt, releasePrompt } from '../../../src/prompts/public/review.mjs';

test('exports review prompt family', () => {
  expect(profilePrompt).toEqual(expect.any(Function));
  expect(allPrompt).toEqual(expect.any(Object));
  expect(releasePrompt).toEqual(expect.any(Object));
});
