import { parseArgs } from '../../src/cli/args.mjs';

test('composes a direct profile with shared options and additions', () => {
  expect(parseArgs([
    'all', '--add', 'first', '--effort=medium', '--dry-run',
    '--model=gpt-5.6-terra', '-a', 'second',
  ])).toMatchObject({
    command: 'analyze-all', effort: 'medium', model: 'gpt-5.6-terra',
    dryRun: true, add: ['first', 'second'],
  });
  expect(parseArgs(['all'])).toMatchObject({ command: 'analyze-all' });
  expect(parseArgs(['--effort=low', 'all'])).toMatchObject({ command: 'analyze-all', effort: 'low' });
});

test('uses help as the public default and preserves parser errors', () => {
  expect(parseArgs([])).toMatchObject({ command: 'help', add: [] });
  expect(() => parseArgs(['unknown'])).toThrow(/Unknown command/);
});
