import { suggestionCategories } from '../../src/profiles/suggestion-registry.mjs';

test('contains suggestion category policy', () => {
  expect(suggestionCategories.security).toEqual(['security']);
  expect(suggestionCategories['cross-platform']).toEqual(['cross_platform']);
});
