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

test('renders non-Error causes without usage guidance', async () => {
  const errors = [];
  await expect(
    runWithCliErrors(
      async () => { throw 'provider failed'; },
      (value) => errors.push(value),
    ),
  ).resolves.toBe(4);
  expect(errors).toEqual(['codescope: provider failed']);
});

test('renders ordinary Errors without usage guidance', async () => {
  const errors = [];
  await expect(
    runWithCliErrors(
      async () => { throw new Error('provider failed'); },
      (value) => errors.push(value),
    ),
  ).resolves.toBe(4);
  expect(errors).toEqual(['codescope: provider failed']);
});

test('uses the default console error writer when none is supplied', async () => {
  const original = console.error;
  const errors = [];
  console.error = (value) => errors.push(value);
  try {
    await expect(runWithCliErrors(async () => { throw new Error('provider failed'); })).resolves.toBe(4);
  } finally {
    console.error = original;
  }
  expect(errors).toEqual(['codescope: provider failed']);
});
