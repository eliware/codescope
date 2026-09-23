import { validateReviewPlatform } from '../../../src/review/options/validate-platform.mjs';

const valid = { cwd: 'repo', environment: {} };

test('accepts supported platform context', () => {
  expect(() => validateReviewPlatform({ ...valid, platform: 'win32' })).not.toThrow();
});

test('rejects invalid path, environment, and platform context', () => {
  expect(() => validateReviewPlatform({ ...valid, cwd: '' })).toThrow(/cwd/);
  expect(() => validateReviewPlatform({ ...valid, envFile: '' })).toThrow(/envFile/);
  expect(() => validateReviewPlatform({ ...valid, environment: [] })).toThrow(/environment/);
  expect(() => validateReviewPlatform({ ...valid, platform: 'plan9' })).toThrow(/unsupported/);
});
