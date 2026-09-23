import { parseMetaCommand } from '../../src/cli/meta-args.mjs';

test('parses help and version metadata commands', () => {
  expect(parseMetaCommand('--help', [])).toEqual({ command: 'help', option: undefined });
  expect(parseMetaCommand('version', ['--version'])).toEqual({
    command: 'version',
    option: '--version',
  });
  expect(parseMetaCommand('other', [])).toBeUndefined();
});

test('supports short and explicit metadata forms', () => {
  expect(parseMetaCommand('-h', [])).toMatchObject({ command: 'help' });
  expect(parseMetaCommand('help', [])).toMatchObject({ command: 'help' });
  expect(parseMetaCommand('help', ['--help'])).toMatchObject({ option: '--help' });
  expect(parseMetaCommand('-v', [])).toMatchObject({ command: 'version' });
  expect(parseMetaCommand('version', [])).toMatchObject({ command: 'version' });
  expect(parseMetaCommand('version', ['-v'])).toMatchObject({ option: '-v' });
});

test('rejects unexpected metadata arguments', () => {
  expect(() => parseMetaCommand('--help', ['extra'])).toThrow(/Unexpected/);
  expect(() => parseMetaCommand('help', ['--bad'])).toThrow(/not valid/);
  expect(() => parseMetaCommand('help', ['extra'])).toThrow(/Unexpected/);
  expect(() => parseMetaCommand('--version', ['extra'])).toThrow(/Unexpected/);
  expect(() => parseMetaCommand('version', ['--bad'])).toThrow(/not valid/);
  expect(() => parseMetaCommand('version', ['extra'])).toThrow(/Unexpected/);
});
