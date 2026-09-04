import { createPriorityPrompt } from '../../src/prompts/priority.mjs';

test('builds a priority prompt through the supplied prompt and tool factories', () => {
  const prompt = createPriorityPrompt(1, {
    profilePrompt: (focus, tool) => ({ focus, tool }),
    createReviewTool: () => ({ name: 'submit_review' }),
  });
  expect(prompt.tool).toEqual({ name: 'submit_review' });
  expect(prompt.focus).toContain('from P0 through P1');
});
