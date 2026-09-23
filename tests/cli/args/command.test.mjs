import { parseCommandArgs } from '../../../src/cli/args/command.mjs';

test('selects a profile command', () => {
  expect(parseCommandArgs(['all'])).toMatchObject({ command: 'analyze-all', add: [] });
});
