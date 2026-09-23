import { allPrompt, combinedAllPrompt } from '../../../src/prompts/public/unified-review.mjs';

test('exports unified review construction', () => {
  expect(allPrompt).toEqual(expect.any(Object));
  expect(combinedAllPrompt).toEqual(expect.any(Object));
});
