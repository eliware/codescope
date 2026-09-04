import { VERSION } from '../../src/cli/version.mjs';

test('loads the package version', () => {
  expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/u);
});
