import { releasePrompt } from '../../../src/prompts/public/release-review.mjs';

test('exports release review construction', () => {
  expect(releasePrompt).toEqual(expect.any(Object));
});
