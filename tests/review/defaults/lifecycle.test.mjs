import { createLifecycleDefaults } from '../../../src/review/defaults/lifecycle.mjs';

test('creates lifecycle defaults', () => {
  expect(createLifecycleDefaults()).toMatchObject({ register: expect.any(Function), usage: false, dryRun: false });
});
