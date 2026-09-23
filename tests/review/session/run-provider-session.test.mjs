import { runProviderSession } from '../../../src/review/session/run-provider-session.mjs';

test('runs a provider session and preserves its response', async () => {
  await expect(runProviderSession({
    client: { responses: { create: async () => ({ output_text: 'ok' }) } },
    request: { model: 'gpt-5.6-sol', input: [] },
    signal: undefined,
  })).resolves.toMatchObject({ kind: 'review', output: 'ok' });
});

test('marks custom prompt sessions and attaches malformed responses to errors', async () => {
  await expect(runProviderSession({
    client: { responses: { create: async () => ({ output_text: 'ok' }) } },
    request: { model: 'gpt-5.6-sol', input: [] },
    signal: undefined, plainText: 'custom',
  })).resolves.toMatchObject({ kind: 'prompt', output: 'ok' });
  const response = { output: [] };
  await expect(runProviderSession({
    client: { responses: { create: async () => response } },
    request: { model: 'gpt-5.6-sol', input: [] }, signal: undefined,
  })).rejects.toMatchObject({ providerResponse: response });
});
