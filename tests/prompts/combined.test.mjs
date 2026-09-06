import { createCombinedAllPrompt } from '../../src/prompts/combined.mjs';

test('builds the unified single-tool request', () => {
  const result = createCombinedAllPrompt({
    allPrompt: {
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'system' }] },
        { role: 'user', content: [{ type: 'input_text', text: 'review' }] },
      ],
    },
    unifiedTool: { name: 'submit_unified_review' },
  });
  expect(result.tools).toEqual([{ name: 'submit_unified_review' }]);
  expect(result.tool_choice).toEqual({ type: 'function', name: 'submit_unified_review' });
  expect(result.parallel_tool_calls).toBeUndefined();
  expect(result.input[1].content[0].text).toContain('one unified report');
  expect(result.input[1].content[0].text).toContain('credible edge cases');
  expect(result.input.at(-1).content[0].text).toContain('provider-output guidance');
  expect(result.input[0].content[0].text).toBe('system');
});

test('builds release-gate completeness guidance', () => {
  const result = createCombinedAllPrompt({
    allPrompt: { input: [{ role: 'user', content: [{ type: 'input_text', text: 'review' }] }] },
    unifiedTool: { name: 'submit_unified_review' },
    releaseGate: true,
  });
  expect(result.input.at(-2).content[0].text).toContain('report only unresolved P0');
});
