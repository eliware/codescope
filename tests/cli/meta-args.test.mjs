import { parseMetaCommand } from '../../src/cli/meta-args.mjs';

test('parses help and version metadata commands', () => {
  expect(parseMetaCommand('--help', [])).toEqual({ command: 'help', option: undefined });
  expect(parseMetaCommand('version', ['--version'])).toEqual({
    command: 'version',
    option: '--version',
  });
  expect(parseMetaCommand('other', [])).toBeUndefined();
});
