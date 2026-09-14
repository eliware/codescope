import { appendUserMessages } from '../../src/prompts/append-user-message.mjs';

test('returns the original request when no additions are supplied', () => {
  const request = { input: [] };
  expect(appendUserMessages(request)).toBe(request);
});

test('rejects requests without a final user input message', () => {
  expect(() => appendUserMessages({ input: [{ role: 'developer', content: [] }] }, ['add'])).toThrow(
    /final user/,
  );
});

test('appends to the final user input text without changing other parts', () => {
  const request = {
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: 'system' }] },
      { role: 'user', content: [{ type: 'input_text', text: 'first' }] },
      {
        role: 'user',
        content: [
          { type: 'output_text', text: 'preserve' },
          { type: 'input_text', text: 'last' },
        ],
      },
    ],
  };
  const result = appendUserMessages(request, ['one', 'two']);
  expect(result.input[1].content[0].text).toBe('first');
  expect(result.input[2].content).toEqual([
    { type: 'output_text', text: 'preserve' },
    { type: 'input_text', text: 'last\n\none\ntwo' },
  ]);
  expect(request.input[2].content[1].text).toBe('last');
});
