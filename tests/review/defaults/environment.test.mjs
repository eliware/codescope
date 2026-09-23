import { createEnvironmentDefaults } from '../../../src/review/defaults/environment.mjs';

test('creates environment defaults', () => {
  expect(createEnvironmentDefaults()).toMatchObject({ readFile: expect.any(Function), openEnvFile: expect.any(Function) });
});
