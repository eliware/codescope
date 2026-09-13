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
  expect(parseArgs([])).toEqual({
    command: 'help',
    option: undefined,
    effort: undefined,
    model: undefined,
  });
});

test('rejects invalid command grammar', () => {
  expect(() => parseArgs(['review', '--dry-run', 'all'])).toThrow(/Profile must precede/);
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
  expect(parseArgs(['help', '-a', 'ignored'])).toMatchObject({ command: 'help' });
  expect(parseArgs(['--help', '--add', 'ignored'])).toMatchObject({ command: 'help' });
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

test('parses grouped dry-run options', () => {
  expect(parseArgs(['review', 'all', '--dry-run'])).toMatchObject({
    command: 'analyze-all',
    dryRun: true,
  });
});
