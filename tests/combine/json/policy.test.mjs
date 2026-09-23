import { isIncludedJson } from '../../../src/combine/json/policy.mjs';

test('includes root and scoped JSON but excludes package metadata and unrelated paths', () => {
  expect(isIncludedJson('root.json')).toBe(true);
  expect(isIncludedJson('specs/contract.json')).toBe(true);
  expect(isIncludedJson('package-lock.json')).toBe(false);
  expect(isIncludedJson('tmp/private.json')).toBe(false);
});
