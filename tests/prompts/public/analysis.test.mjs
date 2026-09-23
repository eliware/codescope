import { createAnalysisPrompt, priorityPrompt } from '../../../src/prompts/public/analysis.mjs';

test('exports analysis prompt family', () => {
  expect(createAnalysisPrompt).toEqual(expect.any(Function));
  expect(priorityPrompt).toEqual(expect.any(Function));
});
