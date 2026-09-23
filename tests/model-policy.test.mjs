import { validateModel } from '../src/model-policy.mjs';

test('accepts supported models and rejects unsupported models', () => {
  expect(() => validateModel('gpt-5.6-sol')).not.toThrow();
  expect(() => validateModel('gpt-6-luna')).not.toThrow();
  expect(() => validateModel('gpt-6-astra')).not.toThrow();
  expect(() => validateModel('gpt-6-sol')).not.toThrow();
  expect(() => validateModel('unknown')).toThrow(/Model must/);
});
