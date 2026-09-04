import { getPromptRouting } from '../../src/profiles/prompt-routing.mjs';

test('routes profile prompts and scoped categories', () => {
  expect(getPromptRouting('security', 'suggest').suggestionCategories).toEqual(['security']);
  expect(getPromptRouting('all', 'review').promptSource.tools.length).toBe(2);
  const release = getPromptRouting('release', 'review').promptSource;
  expect(release.tools.map((tool) => tool.name)).toEqual(['submit_review', 'submit_suggestions']);
  expect(Object.keys(release.tools[1].parameters.properties.suggestions.properties)).not.toContain('new-features');
  expect(getPromptRouting('unlisted', 'review').promptSource).toBeDefined();
});
