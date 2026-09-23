import { createOutputDefaults } from '../../../src/review/defaults/output.mjs';

test('creates output defaults', () => {
  expect(createOutputDefaults().write).toEqual(expect.any(Function));
});
