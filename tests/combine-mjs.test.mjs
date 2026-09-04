import { combineMjsFiles } from '../src/combine-mjs.mjs';
test('public mjs combine barrel exports its function', () => {
  expect(typeof combineMjsFiles).toBe('function');
});
