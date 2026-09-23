import { decorateProfilePrompt } from '../../src/profiles/tool-decoration.mjs';

test('decorates suggestion prompts with the required tool', () => {
  const prompt = decorateProfilePrompt({ tools: [] }, 'suggest', ['security']);
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tool_choice.type).toBe('function');
});
test('leaves generic review prompts without scoped categories undecorated', () => {
  const prompt = decorateProfilePrompt({ input: [], tools: [] }, 'review');
  expect(prompt.tools).toEqual([]);
  expect(prompt.tool_choice).toBeUndefined();
});

test('uses all suggestion categories when none are supplied', () => {
  const prompt = decorateProfilePrompt({ tools: [] }, 'suggest');
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tool_choice.type).toBe('function');
});
