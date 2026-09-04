import { isCodeExtension, isIgnoredDirectory, matchesFile } from '../../src/find/policies.mjs';

test('applies finder extension and test policies', () => {
  expect(isCodeExtension(['.js', '.mjs'])).toBe(true);
  expect(isIgnoredDirectory('NODE_MODULES')).toBe(true);
  expect(matchesFile('a.test.mjs', ['.mjs'], true, false)).toBe(true);
  expect(matchesFile('a.test.mjs', ['.mjs'], false, true)).toBe(false);
  expect(matchesFile('guide.md', '.md', false, false)).toBe(true);
});

test('only ignores generated coverage directories at the scan root', () => {
  expect(isIgnoredDirectory('coverage')).toBe(true);
  expect(isIgnoredDirectory('coverage', 'src')).toBe(false);
  expect(isIgnoredDirectory('.nyc_output', 'src')).toBe(false);
});
