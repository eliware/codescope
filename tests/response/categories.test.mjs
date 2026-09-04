import {
  DEFAULT_REVIEW_CATEGORIES,
  DEFAULT_SUGGESTION_CATEGORIES,
  categoryPrompt,
  validateCategories,
} from '../../src/response/categories.mjs';

test('defines distinct review and suggestion category sets', () => {
  expect(DEFAULT_REVIEW_CATEGORIES).toContain('cross_platform');
  expect(DEFAULT_SUGGESTION_CATEGORIES).toContain('new-features');
  expect(
    categoryPrompt(['security'], 'issues').tools[0].parameters.properties.issues.properties,
  ).toEqual({ security: {} });
});

test('rejects malformed category lists', () => {
  expect(() => validateCategories([])).toThrow(/nonempty/);
  expect(() => validateCategories(['security', 'security'])).toThrow(/unique/);
  expect(() => validateCategories(['security', 1])).toThrow(/string/);
});
