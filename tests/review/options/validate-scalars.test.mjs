import { validateReviewScalars } from '../../../src/review/options/validate-scalars.mjs';

test('accepts valid scalar review options', () => {
  expect(() => validateReviewScalars({ maxSourceChars: 1, usage: false, dryRun: false })).not.toThrow();
});

test('rejects invalid source, additions, and prompt combinations', () => {
  expect(() => validateReviewScalars({ maxSourceChars: 0 })).toThrow(/positive/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, add: ['ok', 1] })).toThrow(/add/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, plainText: 'prompt', dryRun: true })).toThrow(/cannot be combined/);
});

test('rejects invalid model, prompt, and boolean values', () => {
  expect(() => validateReviewScalars({ maxSourceChars: 1, model: ' ' })).toThrow(/Model/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, model: 'unsupported-model' })).toThrow(/Model/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, plainText: ' ' })).toThrow(/plainText/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, usage: 'yes' })).toThrow(/boolean/);
  expect(() => validateReviewScalars({ maxSourceChars: 1, prompt: {} })).toThrow(/input/);
});
