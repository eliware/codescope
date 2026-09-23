import { conventionsPrompt } from '../../../src/prompts/public/convention-review.mjs';

test('exports convention review construction', () => {
  expect(conventionsPrompt).toEqual(expect.any(Object));
});
