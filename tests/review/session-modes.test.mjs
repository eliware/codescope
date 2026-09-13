import { runDrySession, runProviderSession } from '../../src/review/session-modes.mjs';

test('writes and returns dry-run results', async () => {
  const writes = [];
  const result = await runDrySession({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 3 }) } } },
    request: { model: 'gpt-5.6-luna' },
    signal: new AbortController().signal,
    write: async (value) => writes.push(value),
    usage: false,
  });
  expect(result.estimated_input_tokens).toBe(3);
  expect(writes).toHaveLength(1);
});

test('returns provider plain-text output for the prompt path', async () => {
  const writes = [];
  const providerResponse = { output_text: '{"answer":"ok"}' };
  const session = await runProviderSession({
    client: { responses: { create: async () => providerResponse } },
    request: { model: 'gpt-5.6-luna', input: ['prompt'] },
    signal: new AbortController().signal,
    usage: false,
    plainText: true,
  });
  writes.push(session.output);
  expect(session.providerResponse).toBe(providerResponse);
  expect(session.result).toBe('{"answer":"ok"}');
  expect(writes).toEqual(['{"answer":"ok"}']);
});
