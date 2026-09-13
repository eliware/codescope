import { responseText } from '../../src/response/provider-text.mjs';

test('prefers the selected function-call arguments', () => {
  expect(
    responseText(
      { output: [{ type: 'function_call', name: 'review', arguments: '{}' }] },
      { tool_choice: { name: 'review' } },
    ),
  ).toBe('{}');
});

test('rejects non-text selected function-call arguments', () => {
  expect(
    () => responseText(
      { output: [{ type: 'function_call', name: 'review', arguments: { invalid: true } }], output_text: 'fallback' },
      { tool_choice: { name: 'review' } },
    ),
  ).toThrow(/raw text/);
});
