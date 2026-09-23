import { isIgnoredDirectory } from '../../src/find/policies.mjs';

test('only ignores generated coverage directories at the scan root', () => {
  expect(isIgnoredDirectory('NODE_MODULES')).toBe(true);
  expect(isIgnoredDirectory('coverage')).toBe(true);
  expect(isIgnoredDirectory('coverage', 'src')).toBe(false);
  expect(isIgnoredDirectory('.nyc_output', 'src')).toBe(false);
});
