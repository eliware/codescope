import { dispatchMeta } from '../../src/cli/dispatch-meta.mjs';

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
