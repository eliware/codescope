import { preserveProviderResponse } from '../../src/review/response-preservation.mjs';

test('preserves safe provider response fields and redacts output', () => {
  expect(
    preserveProviderResponse({ output_text: 'TOKEN=secret', usage: { input_tokens: 2 } }),
  ).toEqual({
    output_text: 'TOKEN=[redacted]',
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
