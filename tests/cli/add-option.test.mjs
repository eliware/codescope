import { parseAddOptions } from '../../src/cli/add-option.mjs';

test('collects repeated add options in order', () => {
  expect(parseAddOptions(['-a', 'first', '--add', 'second'])).toEqual({
    add: ['first', 'second'],
    remaining: [],
  });
});

test('preserves scalar options for the prompt grammar', () => {
  expect(parseAddOptions(['--effort=low', '-a', 'first', '--dry-run'])).toEqual({
    add: ['first'],
    remaining: ['--effort=low', '--dry-run'],
  });
});

test('rejects add options without values', () => {
  expect(() => parseAddOptions(['--add'])).toThrow(/requires a value/);
});
