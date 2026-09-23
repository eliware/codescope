import { parseCommandArgs } from '../../../src/cli/args/command.mjs';

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
