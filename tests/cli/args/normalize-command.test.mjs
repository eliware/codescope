import { normalizeCommand } from '../../../src/cli/args/normalize-command.mjs';

test('adds shared option values to a parsed command', () => {
  expect(normalizeCommand({ command: 'all' }, {
    effort: ['--effort=low'], model: ['--model=x'], dryRun: 1, usage: 0, add: ['note'],
  })).toMatchObject({ command: 'all', effort: ['--effort=low'], model: ['--model=x'], dryRun: true, add: ['note'] });
});
