import {
  parseCommandOptions,
  parseOptionValues,
} from '../../src/cli/option-values.mjs';

test('parses supported scalar options and removes them from the command tokens', () => {
  expect(parseOptionValues(['all', '--effort=low', '--model=gpt-5.6-sol', '--dry-run'])).toEqual({
    effort: 'low',
    model: 'gpt-5.6-sol',
    dryRun: true,
    add: [],
    remaining: ['all'],
  });
});

test('collects repeated short and long add options in order', () => {
  expect(
    parseOptionValues(['all', '-a', 'first', '--add', 'second', '-a', 'third']),
  ).toMatchObject({
    add: ['first', 'second', 'third'],
    remaining: ['all'],
  });
});

test('rejects duplicate and unsupported scalar options', () => {
  expect(() => parseOptionValues(['all', '--effort=low', '--effort=high'])).toThrow(/Only one/);
  expect(() => parseOptionValues(['all', '--model=a', '--model=b'])).toThrow(/Only one/);
  expect(() => parseOptionValues(['all', '--effort=bad'])).toThrow(/Effort must/);
  expect(() => parseOptionValues(['all', '--model=bad'])).toThrow(/Model must/);
  expect(() => parseOptionValues(['all', '--dry-run', '--dry-run'])).toThrow(/Only one/);
  expect(() => parseOptionValues(['all', '--add'])).toThrow(/requires a value/);
  expect(() => parseOptionValues(['all', '-a', '--usage'])).toThrow(/requires a value/);
});

test('parses command options and rejects unsupported command tokens', () => {
  expect(parseCommandOptions(['--usage'], 'usage', new Set(['--usage']))).toMatchObject({
    remaining: ['--usage'],
  });
  expect(() => parseCommandOptions(['--bad'], 'usage', new Set(['--usage']))).toThrow('usage');
  expect(() => parseCommandOptions(['--version'], 'usage', new Set(), true)).toThrow('not valid');
  expect(() => parseCommandOptions(['--usage', '--usage'], 'usage', new Set(['--usage']))).toThrow(
    'usage',
  );
});
