import { formatSourceSection } from '../../src/combine/section-format.mjs';

test('formats source content with a path header and line numbers', () => {
  expect(formatSourceSection('src/a.mjs', 'one\ntwo\n')).toBe(
    '===== src/a.mjs =====\n1 one\n2 two\n',
  );
  expect(formatSourceSection('empty.mjs', '')).toContain('[empty file]');
});
