import { applyEffort } from '../../src/cli/prompt-options.mjs';

test('clones prompts and applies optional effort', () => {
  const prompt = { reasoning: { effort: 'none' } };
  expect(applyEffort(prompt, 'high')).toEqual({ reasoning: { effort: 'high' } });
  expect(applyEffort(prompt)).toEqual(prompt);
  expect(prompt.reasoning.effort).toBe('none');
});
