import { getPromptRouting } from '../../src/profiles/prompt-routing.mjs';

test('routes profile prompts and scoped categories', () => {
  expect(getPromptRouting('security', 'suggest').suggestionCategories).toEqual(['security']);
  expect(getPromptRouting('all', 'review').promptSource.tools.map((tool) => tool.name)).toEqual([
    'submit_unified_review',
  ]);
  const release = getPromptRouting('release', 'review').promptSource;
  expect(release.tools.map((tool) => tool.name)).toEqual(['submit_unified_review']);
  expect(() => getPromptRouting('unlisted', 'review')).toThrow(/Unknown analysis profile/);
});

test('routes the conventions profile through the full review tool', () => {
  const result = getPromptRouting('conventions', 'review').promptSource;
  expect(result.tools.map((tool) => tool.name)).toEqual(['submit_review']);
  expect(JSON.stringify(result.input)).toContain('package metadata');
});

test('routes generic suggestions and scoped reviews', () => {
  expect(getPromptRouting('conventions', 'suggest').promptSource.tools).toHaveLength(1);
  expect(getPromptRouting('security', 'review').promptSource.tools).toHaveLength(1);
  expect(getPromptRouting('release', 'suggest').promptSource.tools).toHaveLength(1);
  expect(() => getPromptRouting('unknown', 'suggest')).toThrow(/Unknown analysis profile/);
  expect(getPromptRouting('architecture', 'review').promptSource.tools).toHaveLength(1);
  expect(getPromptRouting('cross-platform', 'review').promptSource.tools).toHaveLength(1);
  expect(getPromptRouting('cross-platform', 'other').promptSource).toBeDefined();
});
