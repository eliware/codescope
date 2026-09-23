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

test('rejects a non-array provider output collection', () => {
  expect(() => responseText({ output: {} }, {})).toThrow(/output was not an array/);
});

test('preserves an explicitly empty raw output text', () => {
  expect(responseText({ output_text: '' }, {})).toBe('');
});

test('rejects a response without usable output', () => {
  expect(() => responseText({ output: [] }, {})).toThrow(/usable output/);
});

test('propagates a throwing provider output accessor for safe fallback handling', () => {
  const response = {};
  Object.defineProperty(response, 'output', {
    get() {
      throw new Error('malformed output');
    },
  });
  expect(() => responseText(response, {})).toThrow('malformed output');
});

test('classifies every malformed provider output shape as an invalid response', () => {
  const cases = [
    [{ output: {} }, {}],
    [{ output: [] }, { tool_choice: { name: 'review' } }],
    [
      { output: [{ type: 'function_call', name: 'review', arguments: 1 }] },
      { tool_choice: { name: 'review' } },
    ],
    [
      {
        output: [
          { type: 'function_call', name: 'review', arguments: '{}' },
          { type: 'function_call', name: 'review', arguments: '{}' },
        ],
      },
      { tool_choice: { name: 'review' } },
    ],
    [{ output: [] }, {}],
  ];

  for (const [response, request] of cases) {
    let caught;
    try {
      responseText(response, request);
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({ code: 'INVALID_RESPONSE' });
  }
});

test('preserves an already classified response error', () => {
  const expected = Object.assign(new Error('classified'), { code: 'INVALID_RESPONSE' });
  const response = {};
  Object.defineProperty(response, 'output', {
    get() {
      throw expected;
    },
  });

  let caught;
  try {
    responseText(response, {});
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(expected);
});

test('classifies non-Error provider failures as invalid responses', () => {
  const malformed = Object.create(null);
  const response = {};
  Object.defineProperty(response, 'output', {
    get() {
      throw malformed;
    },
  });

  try {
    responseText(response, {});
  } catch (error) {
    expect(error).toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'Provider response was invalid',
    });
    return;
  }
  throw new Error('Expected malformed provider output to fail');
});
