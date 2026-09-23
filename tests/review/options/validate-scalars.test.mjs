import { validateReviewScalars } from '../../../src/review/options/validate-scalars.mjs';

test('accepts valid scalar review options', () => {
  expect(() => validateReviewScalars({ maxSourceChars: 1, usage: false, dryRun: false })).not.toThrow();
});

test('rejects invalid source, additions, and prompt combinations', () => {
  expect(() => validateReviewScalars({ maxSourceChars: 0 })).toThrow(/positive/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, add: ['ok', 1] })).toThrow(/add/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, plainText: 'prompt', dryRun: true })).toThrow(/cannot be combined/);
});
