import { createCliRuntimeDefaults } from '../../src/cli/runtime-defaults.mjs';

test('creates process-boundary CLI defaults', () => {
  expect(createCliRuntimeDefaults()).toMatchObject({
    output: expect.any(Function),
    error: expect.any(Function),
    write: expect.any(Function),
  });
});
