import { dispatchMeta } from '../../src/cli/dispatch-meta.mjs';
import { parseArgs } from '../../src/cli/args.mjs';

test('parses metadata command variants', () => {
  expect(parseArgs(['--help'])).toMatchObject({ command: 'help' });
  expect(parseArgs(['-h'])).toMatchObject({ command: 'help' });
  expect(parseArgs(['help', '--help'])).toMatchObject({ command: 'help', option: '--help' });
  expect(parseArgs(['version'])).toMatchObject({ command: 'version' });
  expect(parseArgs(['version', '--version'])).toMatchObject({ command: 'version', option: '--version' });
  expect(parseArgs(['--version'])).toMatchObject({ command: 'version' });
  expect(parseArgs(['help', '-a', 'ignored'])).toMatchObject({ command: 'help', add: ['ignored'] });
  expect(parseArgs(['--help', '--add', 'ignored'])).toMatchObject({ command: 'help', add: ['ignored'] });
  expect(parseArgs(['version', '--add', 'ignored'])).toMatchObject({ command: 'version', add: ['ignored'] });
  expect(parseArgs(['--effort=low', 'help', '--model=gpt-5.6-sol', '--usage'])).toEqual({
    command: 'help', option: undefined, effort: 'low', model: 'gpt-5.6-sol', usage: true, add: [],
  });
  expect(parseArgs(['help', '--dry-run'])).toMatchObject({ command: 'help', dryRun: true });
  expect(parseArgs(['--add', 'leading', 'help'])).toMatchObject({ command: 'help', add: ['leading'] });
  expect(parseArgs(['--add', 'leading', 'version'])).toMatchObject({ command: 'version', add: ['leading'] });
  expect(() => parseArgs(['help', '--bad'])).toThrow(/not valid/);
  expect(() => parseArgs(['help', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['version', '--bad'])).toThrow(/not valid/);
  expect(() => parseArgs(['version', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--help', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--version', 'extra'])).toThrow(/Unexpected/);
  expect(() => parseArgs(['--bad'])).toThrow(/Unknown option/);
});

test('dispatches help and version metadata', () => {
  const output = [];
  expect(dispatchMeta('help', undefined, (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('version', undefined, (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('analyze-all', undefined, () => {})).toBe(false);
  expect(output).toHaveLength(2);
});

test('rejects malformed meta-command addition state', () => {
  expect(() => dispatchMeta('help', undefined, () => {}, null)).toThrow(/additions/);
});

test('dispatches short and scoped options', () => {
  const output = [];
  expect(dispatchMeta('review', '--help', (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('review', '-h', (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('review', '--version', (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('review', '-v', (value) => output.push(value))).toBe(true);
  expect(dispatchMeta('other', undefined, () => {})).toBe(false);
  expect(output).toHaveLength(4);
});
