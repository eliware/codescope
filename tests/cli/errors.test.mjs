import { EXIT_CODES, errorExitCode } from '../../src/cli/errors.mjs';

test('maps typed errors to documented exit codes', () => {
  expect(
    errorExitCode(Object.assign(new Error('bad response'), { code: 'INVALID_RESPONSE' })),
  ).toBe(EXIT_CODES.RESPONSE);
  expect(errorExitCode(new Error('Unknown option'))).toBe(EXIT_CODES.USAGE);
});

test('maps lifecycle and configuration errors', () => {
  expect(errorExitCode(Object.assign(new Error('API failure'), { code: 'API' }))).toBe(EXIT_CODES.API);
  expect(errorExitCode(new Error('SIGINT received'))).toBe(EXIT_CODES.SIGINT);
  expect(errorExitCode(new Error('signal termination'))).toBe(EXIT_CODES.SIGTERM);
  expect(errorExitCode(Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' }))).toBe(EXIT_CODES.TEST_TIMEOUT);
  expect(errorExitCode(new Error('Unexpected arguments'))).toBe(EXIT_CODES.USAGE);
  expect(errorExitCode(new Error('OPENAI_API_TOKEN missing'))).toBe(EXIT_CODES.CONFIGURATION);
  expect(errorExitCode(new Error('Unable to read source file'))).toBe(EXIT_CODES.INPUT);
  expect(errorExitCode(new Error('Invalid review response'))).toBe(EXIT_CODES.RESPONSE);
  expect(errorExitCode(new Error('initialize OpenAI failed'))).toBe(EXIT_CODES.API);
  expect(errorExitCode(new Error('unclassified'))).toBe(EXIT_CODES.INPUT);
  expect(errorExitCode({ message: 'OPENAI_API_TOKEN missing' })).toBe(EXIT_CODES.CONFIGURATION);
  expect(errorExitCode({ cause: { message: 'unclassified' } })).toBe(EXIT_CODES.INPUT);
});
