import { safeResponseSummary, summarizeProviderResponse } from '../../src/review/response-summary.mjs';

test('summarizes provider output text and function calls', () => {
  expect(summarizeProviderResponse({ output_text: 'done', usage: { input_tokens: 1 },
    output: [{ type: 'function_call', name: 'review', arguments: '{"ok":true}' }] }))
    .toMatchObject({ output_text: 'done', function_call_arguments: [{ name: 'review' }] });
});

test('ignores non-function output items and invalid output collections', () => {
  expect(summarizeProviderResponse({ output: [{ type: 'message' }] }))
    .not.toHaveProperty('function_call_arguments');
  expect(summarizeProviderResponse({ output: { invalid: true } }))
    .not.toHaveProperty('function_call_arguments');
});

test('returns an empty safe summary when inspection throws', () => {
  const response = new Proxy({}, { get() { throw new Error('malformed response'); } });
  expect(safeResponseSummary(response)).toEqual({});
});
