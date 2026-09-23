import { summarizeProviderResponse } from '../../src/review/response-summary.mjs';

test('summarizes provider output text and function calls', () => {
  expect(summarizeProviderResponse({ output_text: 'done', usage: { input_tokens: 1 },
    output: [{ type: 'function_call', name: 'review', arguments: '{"ok":true}' }] }))
    .toMatchObject({ output_text: 'done', function_call_arguments: [{ name: 'review' }] });
});

test('redacts text and non-string function-call arguments', () => {
  expect(summarizeProviderResponse({ output_text: 'TOKEN=secret',
    output: [{ type: 'function_call', name: 'review', arguments: { token: 'TOKEN=secret' } }] }))
    .toMatchObject({ output_text: 'TOKEN=[REDACTED]',
      function_call_arguments: [{ arguments: '{"token":"TOKEN=[REDACTED]}' }] });
});

test('preserves valid calls when another call is malformed', () => {
  const malformed = { type: 'function_call', name: 'bad' };
  Object.defineProperty(malformed, 'arguments', { get: () => { throw new Error('bad'); } });
  expect(summarizeProviderResponse({ output: [
    { type: 'function_call', name: 'good', arguments: '{"ok":true}' }, malformed,
  ] }).function_call_arguments).toEqual([{ name: 'good', arguments: '{"ok":true}' }]);
});

test('skips calls without serializable names or arguments', () => {
  const name = {};
  Object.defineProperty(name, 'toJSON', { value: () => { throw new Error('bad'); } });
  expect(summarizeProviderResponse({ output: [
    { type: 'function_call', arguments: 'ignored' },
    { type: 'function_call', name: 'review', arguments: undefined },
    { type: 'function_call', name, arguments: 'bad' },
  ] })).not.toHaveProperty('function_call_arguments');
});

test('ignores non-function output items and invalid output collections', () => {
  expect(summarizeProviderResponse({ output: [{ type: 'message' }] }))
    .not.toHaveProperty('function_call_arguments');
  expect(summarizeProviderResponse({ output: { invalid: true } }))
    .not.toHaveProperty('function_call_arguments');
});
