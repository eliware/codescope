import { isIncludedContent } from '../../src/combine/other-policy.mjs';

test('identifies content files excluded from other-file metadata', () => {
  expect(isIncludedContent('src/app.mjs')).toBe(true);
  expect(isIncludedContent('README.md')).toBe(true);
  expect(isIncludedContent('asset.bin')).toBe(false);
});
