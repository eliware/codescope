import { findMdFiles } from '../src/find-md.mjs';

test('re-exports markdown discovery', () => {
  expect(findMdFiles).toBeDefined();
});
