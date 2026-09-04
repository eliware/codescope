import { createProfileCombiner } from '../../src/profiles/source-selection.mjs';

test('creates review and suggestion source selectors', () => {
  expect(typeof createProfileCombiner([true, false, false], 'review')).toBe('function');
  expect(typeof createProfileCombiner([true, false, false], 'suggest')).toBe('function');
});
