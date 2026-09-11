import { responseText } from '../../src/response/provider-text.mjs';

test('prefers the selected function-call arguments', () => {
  expect(
    responseText(
      { output: [{ type: 'function_call', name: 'review', arguments: '{}' }] },
      { tool_choice: { name: 'review' } },
    ),
  ).toBe('{}');
});

test('preserves malformed selected function-call arguments instead of falling back', () => {
  expect(
    responseText(
      { output: [{ type: 'function_call', name: 'review', arguments: { invalid: true } }], output_text: 'fallback' },
      { tool_choice: { name: 'review' } },
    ),
  ).toBe('{"invalid":true}');
});
