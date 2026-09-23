import { combineCodeFiles, combineMdFiles, combineMjsFiles } from '../../src/combine/source-file-aliases.mjs';

test('exposes source-category composition strategies', () => {
  expect(combineMjsFiles).toEqual(expect.any(Function));
  expect(combineMdFiles).toEqual(expect.any(Function));
  expect(combineCodeFiles).toEqual(expect.any(Function));
});
