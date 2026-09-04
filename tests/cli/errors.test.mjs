import { EXIT_CODES, errorExitCode } from '../../src/cli/errors.mjs';

test('maps typed errors to documented exit codes', () => {
  expect(
    errorExitCode(Object.assign(new Error('bad response'), { code: 'INVALID_RESPONSE' })),
  ).toBe(EXIT_CODES.RESPONSE);
  expect(errorExitCode(new Error('Unknown option'))).toBe(EXIT_CODES.USAGE);
});
