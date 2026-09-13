import { parseAddOptions } from '../../src/cli/add-option.mjs';

test('collects repeated add options in order', () => {
  expect(parseAddOptions(['-a', 'first', '--add', 'second'])).toEqual({
    add: ['first', 'second'],
    remaining: [],
  });
});

test('rejects add options without values', () => {
  expect(() => parseAddOptions(['--add'])).toThrow(/requires a value/);
});
