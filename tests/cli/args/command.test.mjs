import { parseArgs, parseCommandArgs } from '../../../src/cli/args/command.mjs';

test('selects a profile command', () => {
  expect(parseCommandArgs(['all'])).toMatchObject({ command: 'analyze-all', add: [] });
  expect(parseCommandArgs([])).toMatchObject({ command: 'help' });
});

test('selects prompt, grouped, metadata, and invalid command forms', () => {
  expect(parseCommandArgs(['prompt', 'summarize', 'code']).command).toBe('prompt');
  expect(parseCommandArgs(['review', 'all']).mode).toBe('review');
  expect(parseCommandArgs(['--help']).command).toBe('help');
  expect(() => parseCommandArgs(['--unknown'])).toThrow(/Unknown option/);
  expect(parseCommandArgs(['all', '--dry-run'])).toMatchObject({ command: 'analyze-all', dryRun: true });
  expect(parseCommandArgs(['all', '--usage'])).toMatchObject({ command: 'analyze-all', usage: true });
  expect(parseCommandArgs(['help', '--dry-run', '--usage'])).toMatchObject({ command: 'help', dryRun: true, usage: true });
});

test('merges leading options into the command parse', () => {
  expect(parseArgs(['all', '--add', 'first', '--effort=medium', '-a', 'second']))
    .toMatchObject({ command: 'analyze-all', effort: 'medium', add: ['first', 'second'] });
  expect(parseArgs(['--effort=low', 'all'])).toMatchObject({ command: 'analyze-all', effort: 'low' });
});

test('rejects conflicting leading and command options', () => {
  expect(() => parseArgs(['--effort=low', 'all', '--effort=high'])).toThrow(/effort/);
  expect(() => parseArgs(['--model=gpt-5.6-luna', 'all', '--model=gpt-5.6-sol'])).toThrow(/model/);
  expect(() => parseArgs(['--dry-run', 'all', '--dry-run'])).toThrow(/dry-run/);
  expect(() => parseArgs(['--usage', 'all', '--usage'])).toThrow(/usage/);
});

test('rejects dry-run before prompt text', () => {
  expect(() => parseArgs(['--dry-run', 'prompt', 'summarize'])).toThrow(/Usage/);
});

test('preserves merged flags and additions from both sides', () => {
  expect(parseArgs(['--usage', '--add', 'leading', 'all', '--add', 'trailing']))
    .toMatchObject({ command: 'analyze-all', usage: true, add: ['leading', 'trailing'] });
  expect(parseArgs(['--effort=low', 'all', '--dry-run'])).toMatchObject({ command: 'analyze-all', dryRun: true });
});
