import { parseArgs } from '../../src/cli/args.mjs';

test('parses grouped review options', () => {
  expect(parseArgs(['review', 'all', '--effort=low'])).toMatchObject({
    command: 'analyze-all',
    mode: 'review',
    effort: 'low',
  });
});

test('passes repeated additions through profile commands', () => {
  expect(parseArgs(['all', '-a', 'first', '--add', 'second'])).toMatchObject({
    command: 'analyze-all',
    add: ['first', 'second'],
  });
  expect(parseArgs(['prompt', 'summarize', '-a', 'first', '--add', 'second'])).toMatchObject({
    command: 'prompt',
    add: ['first', 'second'],
  });
});

test('parses direct profiles and shared options', () => {
  expect(parseArgs(['all', '--usage'])).toMatchObject({
    command: 'analyze-all',
    option: '--usage',
  });
  expect(parseArgs(['architecture', '--model=gpt-5.6-terra', '--dry-run'])).toMatchObject({
    model: 'gpt-5.6-terra',
    dryRun: true,
  });
  expect(parseArgs(['all', '--dry-run'])).toMatchObject({ dryRun: true });
  expect(parseArgs([])).toEqual({
    command: 'help',
    option: undefined,
    effort: undefined,
    model: undefined,
    add: [],
  });
});

test('rejects invalid command grammar', () => {
  expect(parseArgs(['review', '--dry-run', 'all'])).toMatchObject({
    command: 'analyze-all',
    dryRun: true,
  });
  expect(() => parseArgs(['review', 'missing'])).toThrow(/Unknown command profile/);
  expect(() => parseArgs(['review', 'new-features'])).toThrow(/suggestion-only/);
  expect(() => parseArgs(['unknown'])).toThrow(/Unknown command/);
});

test('parses metadata command variants', () => {
  expect(parseArgs(['--help'])).toMatchObject({ command: 'help' });
  expect(parseArgs(['-h'])).toMatchObject({ command: 'help' });
  expect(parseArgs(['help', '--help'])).toMatchObject({ command: 'help', option: '--help' });
  expect(parseArgs(['version'])).toMatchObject({ command: 'version' });
  expect(parseArgs(['version', '--version'])).toMatchObject({
    command: 'version',
    option: '--version',
  });
  expect(parseArgs(['--version'])).toMatchObject({ command: 'version' });
  expect(parseArgs(['help', '-a', 'ignored'])).toMatchObject({
    command: 'help',
    add: ['ignored'],
  });
  expect(parseArgs(['--help', '--add', 'ignored'])).toMatchObject({
    command: 'help',
    add: ['ignored'],
  });
  expect(parseArgs(['version', '--add', 'ignored'])).toMatchObject({
    command: 'version',
    add: ['ignored'],
  });
  expect(parseArgs(['--effort=low', 'help', '--model=gpt-5.6-sol', '--usage'])).toEqual({
    command: 'help',
    option: undefined,
    effort: 'low',
    model: 'gpt-5.6-sol',
    usage: true,
    add: [],
  });
  expect(parseArgs(['help', '--dry-run'])).toMatchObject({ command: 'help', dryRun: true });
  expect(parseArgs(['--add', 'leading', 'help'])).toMatchObject({
    command: 'help',
    add: ['leading'],
  });
  expect(parseArgs(['--add', 'leading', 'version'])).toMatchObject({
    command: 'version',
    add: ['leading'],
  });
  expect(() => parseArgs(['help', '--bad'])).toThrow(/not valid/);
  expect(() => parseArgs(['help', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['version', '--bad'])).toThrow(/not valid/);
  expect(() => parseArgs(['version', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--help', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--version', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--bad'])).toThrow(/Unknown option/);
});

test('routes custom prompt arguments', () => {
  expect(parseArgs(['prompt', 'review', 'this', 'code', '--effort=medium'])).toMatchObject({
    command: 'prompt',
    promptText: 'review this code',
    effort: 'medium',
  });
});

test('parses the documented prompt delimiter through the public CLI parser', () => {
  expect(parseArgs(['prompt', '--summarize', 'this', 'repository', '--', '--effort=low'])).toMatchObject({
    command: 'prompt',
    promptText: '--summarize this repository',
    effort: 'low',
  });
});

test('accepts separated scalar options in prompt syntax', () => {
  expect(parseArgs(['prompt', 'summarize', '--effort', 'low'])).toMatchObject({
    command: 'prompt',
    effort: 'low',
  });
});

test('parses grouped dry-run options', () => {
  expect(parseArgs(['review', 'all', '--dry-run'])).toMatchObject({
    command: 'analyze-all',
    dryRun: true,
  });
});

test('accepts shared scalar options before a command', () => {
  expect(parseArgs(['--effort=low', 'all'])).toMatchObject({
    command: 'analyze-all',
    effort: 'low',
  });
  expect(parseArgs(['--model=gpt-5.6-terra', 'review', 'all'])).toMatchObject({
    command: 'analyze-all',
    mode: 'review',
    model: 'gpt-5.6-terra',
  });
  expect(() => parseArgs(['--dry-run', 'prompt', 'text'])).toThrow(/Usage/);
  expect(() => parseArgs(['--effort=low', 'all', '--effort=high'])).toThrow(/Only one --effort/);
  expect(() => parseArgs(['--model=gpt-5.6-luna', 'all', '--model=gpt-5.6-sol'])).toThrow(
    /Only one --model/,
  );
  expect(() => parseArgs(['--dry-run', 'all', '--dry-run'])).toThrow(/Only one --dry-run/);
  expect(parseArgs(['--dry-run', 'all'])).toMatchObject({ command: 'analyze-all', dryRun: true });
  expect(parseArgs(['--effort', 'low', 'all'])).toMatchObject({ command: 'analyze-all', effort: 'low' });
  expect(parseArgs(['--model', 'gpt-5.6-terra', 'all'])).toMatchObject({
    command: 'analyze-all',
    model: 'gpt-5.6-terra',
  });
  expect(parseArgs(['--effort', 'low', 'review', 'all'])).toMatchObject({
    command: 'analyze-all',
    mode: 'review',
    effort: 'low',
  });
  expect(parseArgs(['all', '--model', 'gpt-5.6-terra'])).toMatchObject({
    command: 'analyze-all',
    model: 'gpt-5.6-terra',
  });
  expect(() => parseArgs(['--effort'])).toThrow(/requires a value/);
  expect(() => parseArgs(['--model'])).toThrow(/requires a value/);
  expect(() => parseArgs(['--effort', '--dry-run', 'all'])).toThrow(/requires a value/);
  expect(() => parseArgs(['--model', '--usage', 'all'])).toThrow(/requires a value/);
  expect(() => parseArgs(['all', '--effort'])).toThrow(/requires a value/);
  expect(parseArgs(['--add', 'first', 'all', '--add', 'second'])).toMatchObject({
    command: 'analyze-all',
    add: ['first', 'second'],
  });
  expect(parseArgs(['--add', 'first', 'review', 'all', '--add', 'second'])).toMatchObject({
    command: 'analyze-all',
    add: ['first', 'second'],
  });
  expect(parseArgs(['--add', 'first', 'all', '--add', 'second', '--add', 'third'])).toMatchObject({
    command: 'analyze-all',
    add: ['first', 'second', 'third'],
  });
  expect(parseArgs(['--usage', 'all'])).toMatchObject({ command: 'analyze-all', option: undefined, usage: true });
  expect(() => parseArgs(['--usage', 'all', '--usage'])).toThrow(/Only one --usage/);
  expect(parseArgs(['-a', 'first', 'review', 'all'])).toMatchObject({
    command: 'analyze-all',
    add: ['first'],
  });
  expect(() => parseArgs(['--add'])).toThrow(/requires a value/);
  expect(parseArgs(['--add', '--dry-run'])).toMatchObject({ command: 'help', add: ['--dry-run'] });
});

test('normalizes direct profile scalar options exactly once', () => {
  expect(
    parseArgs([
      'all',
      '--add',
      'first',
      '--effort=medium',
      '--dry-run',
      '--model=gpt-5.6-terra',
      '-a',
      'second',
    ]),
  ).toMatchObject({
    command: 'analyze-all',
    effort: 'medium',
    model: 'gpt-5.6-terra',
    dryRun: true,
    add: ['first', 'second'],
  });
  expect(() => parseArgs(['all', '--effort=low', '--effort=high'])).toThrow(/Only one --effort/);
  expect(() => parseArgs(['all', '--model=one', '--model=two'])).toThrow(/Only one --model/);
  expect(() => parseArgs(['all', '--dry-run', '--dry-run'])).toThrow(/Only one --dry-run/);
  expect(() => parseArgs(['all', '--effort=low', 'unexpected'])).toThrow(/Unexpected/);
});
