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
