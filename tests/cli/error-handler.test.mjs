import { runWithCliErrors } from '../../src/cli/error-handler.mjs';

test('returns operation results without handling successful calls', async () => {
  await expect(
    runWithCliErrors(
      async () => 7,
      () => {},
    ),
  ).resolves.toBe(7);
});

test('renders errors and maps their exit code', async () => {
  const errors = [];
  await expect(
    runWithCliErrors(
      async () => {
        throw new Error('Unknown command: x');
      },
      (value) => errors.push(value),
    ),
  ).resolves.toBe(2);
  expect(errors).toEqual(['codescope: Unknown command: x', 'Run "codescope --help" for usage.']);
});
