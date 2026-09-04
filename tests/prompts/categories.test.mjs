import { REVIEW_CATEGORIES, SUGGESTION_CATEGORIES } from '../../src/prompts/categories.mjs';

test('defines review and suggestion category sets', () => {
  expect(REVIEW_CATEGORIES).toContain('cross_platform');
  expect(SUGGESTION_CATEGORIES).toContain('new-features');
});
