import { createCombinedAllPrompt } from '../../src/prompts/combined.mjs';

test('builds the unified single-tool request', () => {
  const result = createCombinedAllPrompt({
    allPrompt: { input: [{ role: 'user', content: [{ type: 'input_text', text: 'review' }] }] },
    unifiedTool: { name: 'submit_unified_review' },
  });
  expect(result.tools).toEqual([{ name: 'submit_unified_review' }]);
  expect(result.tool_choice).toEqual({ type: 'function', name: 'submit_unified_review' });
  expect(result.parallel_tool_calls).toBeUndefined();
  expect(result.input[0].content[0].text).toContain('one unified report');
});
