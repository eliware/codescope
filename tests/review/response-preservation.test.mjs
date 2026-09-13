import { preserveProviderResponse } from '../../src/review/response-preservation.mjs';

test('preserves safe provider response fields and redacts output', () => {
  expect(
    preserveProviderResponse({ output_text: 'TOKEN=secret', usage: { input_tokens: 2 } }),
  ).toEqual({
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
  expect(preserveProviderResponse(response)).toEqual({
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
  expect(preserveProviderResponse(response)).toEqual({
    response_error: 'Provider response could not be serialized',
  });
});

test('preserves a serializable response with no function calls', () => {
  expect(preserveProviderResponse({ output: [] })).toEqual({
    response_error: 'Provider response was not accepted by the response contract',
  });
});

test('ignores malformed function-call collections without losing the response', () => {
  const call = { type: 'function_call', name: 'review' };
  Object.defineProperty(call, 'arguments', { get: () => { throw new Error('bad'); } });
  expect(preserveProviderResponse({ output: [call] })).toEqual({
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

test('ignores non-function output items', () => {
  expect(preserveProviderResponse({ output: [{ type: 'message' }] })).toEqual({
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
