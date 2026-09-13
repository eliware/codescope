import { joinCombinedSections } from '../../src/combine/combined-source.mjs';

test('joins non-empty sections and enforces the shared character limit', () => {
  expect(joinCombinedSections(['one', '', 'two'])).toBe('one\ntwo');
  expect(() => joinCombinedSections(['12345'], 4)).toThrow(
    'Combined source exceeds the 4-character limit',
  );
});
