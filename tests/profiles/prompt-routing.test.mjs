import { getPromptRouting } from '../../src/profiles/prompt-routing.mjs';

test('routes profile prompts and scoped categories', () => {
  expect(getPromptRouting('security', 'suggest').suggestionCategories).toEqual(['security']);
  expect(getPromptRouting('all', 'review').promptSource.tools.length).toBe(2);
});
