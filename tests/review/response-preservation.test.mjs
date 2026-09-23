import { preserveProviderResponse } from '../../src/review/response-preservation.mjs';

test('combines safe summary and serialization diagnostics', () => {
  expect(preserveProviderResponse({ output_text: 'TOKEN=secret', usage: { input_tokens: 2 } }))
    .toMatchObject({ output_text: 'TOKEN=[REDACTED]', usage: { input_tokens: 2 },
      response_error: 'Provider response was not accepted by the response contract' });
});

test('keeps safe function-call summaries when the response is cyclic', () => {
  const response = { output: [{ type: 'function_call', name: 'review', arguments: '{"ok":true}' }] };
  response.self = response;
  expect(preserveProviderResponse(response)).toMatchObject({
    function_call_arguments: [{ name: 'review', arguments: '{"ok":true}' }],
    response_error: 'Provider response could not be serialized',
  });
});

test('returns no diagnostic for an absent response', () => {
  expect(preserveProviderResponse(undefined)).toBeUndefined();
});
