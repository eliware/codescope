import { isCodeExtension, matchesFile, TEST_FILE_PATTERN } from '../../src/find/extensions.mjs';

test('recognizes supported implementation extensions', () => {
  expect(isCodeExtension('.mjs')).toBe(true);
  expect(isCodeExtension(['.js', '.cjs', '.mjs', '.ts'])).toBe(true);
  expect(isCodeExtension('.md')).toBe(false);
});

test('matches code and exact test extensions', () => {
  expect(matchesFile('app.MJS', '.mjs', false, false)).toBe(true);
  expect(matchesFile('app.test.mjs', ['.js', '.mjs', '.cjs', '.ts'], false, true)).toBe(false);
  expect(matchesFile('app.test.mjs', ['.js', '.mjs', '.cjs', '.ts'], true, false)).toBe(true);
  expect(matchesFile('app.test.ts', ['.js', '.mjs', '.cjs', '.ts'], true, false)).toBe(false);
  expect(TEST_FILE_PATTERN.test('app.test.cjs')).toBe(true);
});
