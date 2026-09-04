import { findMjsFiles } from '../src/find-mjs.mjs';
test('public mjs finder barrel exports its function', () => {
  expect(typeof findMjsFiles).toBe('function');
});
