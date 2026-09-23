import { parseLeadingOptions } from '../../../src/cli/args/parse-leading-options.mjs';

test('parses leading options and preserves the command suffix', () => {
  expect(parseLeadingOptions(['--dry-run', '--effort=low', 'all', '--add', 'focus'])).toEqual({
    add: ['focus'], effort: ['--effort=low'], model: [], dryRun: 1, usage: 0,
    remaining: ['all', '--add', 'focus'], consumed: 2,
  });
});

test('collects additions after the first non-option token', () => {
  expect(parseLeadingOptions(['prompt', 'text', '-a', 'one', '--add', 'two'])).toEqual({
    add: ['one', 'two'], effort: [], model: [], dryRun: 0, usage: 0,
    remaining: ['prompt', 'text', '-a', 'one', '--add', 'two'], consumed: 0,
  });
});

test('collects additions and model options before the command', () => {
  expect(parseLeadingOptions(['--add', 'first', '--model=gpt-5.6-sol', 'all'])).toEqual({
    add: ['first'], effort: [], model: ['--model=gpt-5.6-sol'], dryRun: 0, usage: 0,
    remaining: ['all'], consumed: 3,
  });
});
