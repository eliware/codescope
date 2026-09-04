import { combineMdFiles } from '../src/combine-md.mjs';

test('re-exports the markdown combiner', () => {
  expect(combineMdFiles).toBeDefined();
});
