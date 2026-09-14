import { preserveProviderResponse } from '../../src/review/response-preservation.mjs';

test('preserves safe provider response fields and redacts output', () => {
  expect(
    preserveProviderResponse({ output_text: 'TOKEN=secret', usage: { input_tokens: 2 } }),
  ).toMatchObject({
    output_text: 'TOKEN=[REDACTED]',
    usage: { input_tokens: 2 },
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('preserves a safe summary when non-enumerable getters throw', () => {
  const response = {};
  Object.defineProperty(response, 'output_text', {
    enumerable: false,
    get: () => {
      throw new Error('bad');
    },
  });
  Object.defineProperty(response, 'usage', {
    enumerable: false,
    get: () => {
      throw new Error('bad');
    },
  });
  expect(preserveProviderResponse(response)).toMatchObject({
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('preserves redacted function-call arguments', () => {
  expect(
    preserveProviderResponse({
      output: [{ type: 'function_call', name: 'review', arguments: 'TOKEN=secret' }],
    }),
  ).toMatchObject({ function_call_arguments: expect.stringContaining('TOKEN=[REDACTED]') });
});

test('survives an invalid output collection while preserving the response summary', () => {
  const response = { output: { invalid: true } };
  response.self = response;
  expect(preserveProviderResponse(response)).toMatchObject({
    response_error: 'Provider response could not be serialized',
  });
});

test('preserves a serializable response with no function calls', () => {
  expect(preserveProviderResponse({ output: [] })).toMatchObject({
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('marks capped fallback diagnostics explicitly', () => {
  const response = { output_text: 'x'.repeat(500_001) };
  const result = preserveProviderResponse(response);
  expect(result.response_truncated).toBe(true);
  expect(result.response.length).toBeLessThanOrEqual(500_000);
});

test('ignores malformed function-call collections without losing the response', () => {
  const call = { type: 'function_call', name: 'review' };
  Object.defineProperty(call, 'arguments', { get: () => { throw new Error('bad'); } });
  expect(preserveProviderResponse({ output: [call] })).toMatchObject({
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('preserves function-call arguments from an unserializable response', () => {
  const response = {
    output: [{ type: 'function_call', name: 'review', arguments: '{"ok":true}' }],
  };
  response.self = response;
  expect(preserveProviderResponse(response).function_call_arguments).toContain('review');
});

test('redacts non-string function-call arguments safely', () => {
  expect(
    preserveProviderResponse({
      output: [{ type: 'function_call', name: 'review', arguments: { token: 'TOKEN=secret' } }],
    }),
  ).toMatchObject({ function_call_arguments: expect.stringContaining('[REDACTED]') });
});

test('omits a summary when the safe call list cannot be serialized', () => {
  const name = {};
  Object.defineProperty(name, 'toJSON', { value: () => { throw new Error('bad'); } });
  expect(
    preserveProviderResponse({ output: [{ type: 'function_call', name, arguments: 'ok' }] }),
  ).not.toHaveProperty('function_call_arguments');
});

test('preserves safe function calls when another call is malformed', () => {
  const malformed = { type: 'function_call', name: 'bad' };
  Object.defineProperty(malformed, 'arguments', { get: () => { throw new Error('bad'); } });
  const result = preserveProviderResponse({
    output: [
      { type: 'function_call', name: 'good', arguments: '{"ok":true}' },
      malformed,
    ],
  });
  expect(result.function_call_arguments).toContain('good');
  expect(result.function_call_arguments).not.toContain('bad');
});

test('preserves a valid function call when another call cannot be serialized', () => {
  const malformedName = {};
  Object.defineProperty(malformedName, 'toJSON', { value: () => { throw new Error('bad'); } });
  const result = preserveProviderResponse({
    output: [
      { type: 'function_call', name: 'good', arguments: '{"ok":true}' },
      { type: 'function_call', name: malformedName, arguments: 'bad' },
    ],
  });
  expect(result.function_call_arguments).toContain('good');
});

test('ignores non-function output items', () => {
  expect(preserveProviderResponse({ output: [{ type: 'message' }] })).toMatchObject({
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('omits function-call summaries that cannot be serialized', () => {
  const args = {};
  Object.defineProperty(args, 'toJSON', { value: () => { throw new Error('bad'); } });
  expect(preserveProviderResponse({ output: [{ type: 'function_call', name: 'bad', arguments: args }] })).toEqual({
    response_error: 'Provider response could not be serialized',
  });
});
