import { validateEntryNames } from '../../src/find/entries.mjs';

test('validates directory entry names', () => {
  expect(() => validateEntryNames([{ name: 'src' }], '.')).not.toThrow();
  expect(() => validateEntryNames([{ name: '../escape' }], '.')).toThrow(
    'Invalid directory entry name',
  );
});
