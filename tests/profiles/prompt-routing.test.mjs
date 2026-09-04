import { getPromptRouting } from '../../src/profiles/prompt-routing.mjs';

test('routes profile prompts and scoped categories', () => {
  expect(getPromptRouting('security', 'suggest').suggestionCategories).toEqual(['security']);
  expect(getPromptRouting('all', 'review').promptSource.tools.map((tool) => tool.name)).toEqual([
    'submit_unified_review',
  ]);
  const release = getPromptRouting('release', 'review').promptSource;
  expect(release.tools.map((tool) => tool.name)).toEqual(['submit_unified_review']);
  expect(getPromptRouting('unlisted', 'review').promptSource).toBeDefined();
});
