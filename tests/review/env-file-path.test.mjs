import { defaultEnvFile } from '../../src/review/env-file-path.mjs';

test('resolves the default codescope environment file', () => {
  expect(defaultEnvFile()).toContain('.codescope');
});
