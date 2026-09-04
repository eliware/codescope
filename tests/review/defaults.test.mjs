import { createReviewDefaults } from '../../src/review/defaults.mjs';
test('creates the review collaborator defaults', () => {
  const defaults = createReviewDefaults();
  expect(defaults.maxSourceChars).toBe(2_000_000);
  expect(defaults.testTimeoutMs).toBe(30_000);
  expect(typeof defaults.combine).toBe('function');
  expect(typeof defaults.createClient).toBe('function');
});
