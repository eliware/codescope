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

test('rejects multiple matching function calls instead of choosing silently', () => {
  expect(() =>
    responseText(
      {
        output: [
          { type: 'function_call', name: 'review', arguments: '{}' },
          { type: 'function_call', name: 'review', arguments: '{"second":true}' },
        ],
      },
      { tool_choice: { name: 'review' } },
    ),
  ).toThrow(/multiple matching/);
});

test('rejects a missing required function call', () => {
  expect(() =>
    responseText(
      { output: [{ type: 'function_call', name: 'other', arguments: '{}' }], output_text: 'fallback' },
      { tool_choice: { name: 'review' } },
    ),
  ).toThrow(/required function call/);
});

test('preserves an explicitly empty raw output text', () => {
  expect(responseText({ output_text: '' }, {})).toBe('');
});
