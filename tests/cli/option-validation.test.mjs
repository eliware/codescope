import { validateEffort } from '../../src/cli/option-validation.mjs';

test('validates supported effort and model values', () => {
  expect(() => validateEffort('none')).not.toThrow();
  expect(() => validateEffort('invalid')).toThrow();
});
