import { createCombinedAllPrompt } from '../../src/prompts/combined.mjs';

test('builds the parallel review and suggestion request', () => {
  const result = createCombinedAllPrompt({
    allPrompt: { input: [{ role: 'user', content: [{ type: 'input_text', text: 'review' }] }] },
    reviewTool: 'review',
    suggestionTool: 'suggest',
  });
  expect(result.tools).toEqual(['review', 'suggest']);
  expect(result.tool_choice).toBe('auto');
  expect(result.parallel_tool_calls).toBe(true);
  expect(result.input[0].content[0].text).toContain('exactly one submit_review');
});
