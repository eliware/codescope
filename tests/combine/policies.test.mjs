import { validateCombineOptions } from '../../src/combine/policies.mjs';

const valid = { concurrency: 2, maxChars: 100, platform: 'win32' };

test('accepts valid combine policies', () => {
  expect(() => validateCombineOptions('repo', valid)).not.toThrow();
  expect(() => validateCombineOptions('repo', { ...valid, maxChars: Infinity })).not.toThrow();
});

test('rejects invalid concurrency, limits, and foreign roots', () => {
  expect(() => validateCombineOptions('repo', { ...valid, concurrency: 0 })).toThrow(/concurrency/);
  expect(() => validateCombineOptions('repo', { ...valid, maxChars: 0 })).toThrow(/maxChars/);
  expect(() => validateCombineOptions('repo', { ...valid, maxChars: 1.5 })).toThrow(/maxChars/);
  expect(() => validateCombineOptions('C:\\repo', { ...valid, platform: 'linux' })).toThrow(
    /Windows-style/,
  );
  expect(() => validateCombineOptions('\\\\server\\share', { ...valid, platform: 'linux' })).toThrow(
    /Windows-style/,
  );
});
