import { createProviderDefaults } from '../../../src/review/defaults/provider.mjs';

test('creates provider defaults', () => {
  expect(createProviderDefaults().createClient).toEqual(expect.any(Function));
});
