import { validateEffort, validateModel } from '../../src/cli/option-validation.mjs';

test('validates supported effort and model values', () => {
  expect(() => validateEffort('none')).not.toThrow();
  expect(() => validateModel('gpt-5.6-luna')).not.toThrow();
  expect(() => validateEffort('invalid')).toThrow();
  expect(() => validateModel('invalid')).toThrow();
});
