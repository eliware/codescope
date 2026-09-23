export const EXIT_CODES = Object.freeze({
  PASS: 0,
  BLOCKED: 1,
  USAGE: 2,
  CONFIGURATION: 3,
  INPUT: 4,
  API: 5,
  RESPONSE: 6,
  TEST_TIMEOUT: 124,
  SIGINT: 130,
  SIGTERM: 143,
});

const errorText = (cause) => {
  const messages = [];
  for (let current = cause; current; current = current.cause)
    if (current instanceof Error || typeof current?.message === 'string')
      messages.push(current.message);
  return messages.join(' ');
};

const hasErrorCode = (cause, code) => {
  for (let current = cause; current; current = current.cause)
    if (current.code === code) return true;
  return false;
};

export function errorExitCode(cause) {
  const text = errorText(cause);
  if (hasErrorCode(cause, 'SIGINT')) return EXIT_CODES.SIGINT;
  if (hasErrorCode(cause, 'SIGTERM')) return EXIT_CODES.SIGTERM;
  if (cause?.code === 'API') return EXIT_CODES.API;
  if (cause?.code === 'INVALID_RESPONSE') return EXIT_CODES.RESPONSE;
  if (cause?.code === 'ETIMEDOUT' || /timed out/u.test(text)) return EXIT_CODES.TEST_TIMEOUT;
  if (
    /Usage:|Unknown command|Unknown option|Unexpected arguments|requires a value|Effort must be|not valid for/u.test(
      text,
    )
  )
    return EXIT_CODES.USAGE;
  if (/OPENAI_API_TOKEN|\.codescope|environment variable/u.test(text))
    return EXIT_CODES.CONFIGURATION;
  if (/Unable to (read|inspect)|ENOENT|input file|source file/u.test(text)) return EXIT_CODES.INPUT;
  if (
    /Invalid (review|suggestion|combined|tool|function) response|verdict|category array/u.test(text)
  )
    return EXIT_CODES.RESPONSE;
  if (/OpenAI|API request|initialize OpenAI|authentication/u.test(text)) return EXIT_CODES.API;
  return EXIT_CODES.INPUT;
}
