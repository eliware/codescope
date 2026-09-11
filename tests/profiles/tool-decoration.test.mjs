import { decorateProfilePrompt } from '../../src/profiles/tool-decoration.mjs';

test('decorates suggestion prompts with the required tool', () => {
  const prompt = decorateProfilePrompt({ tools: [] }, 'suggest', ['security']);
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tool_choice.type).toBe('function');
});
