import { runProviderSession } from '../../../src/review/session/run-provider-session.mjs';

test('runs a provider session and preserves its response', async () => {
  await expect(runProviderSession({
    client: { responses: { create: async () => ({ output_text: 'ok' }) } },
    request: { model: 'gpt-5.6-sol', input: [] },
    signal: undefined,
  })).resolves.toMatchObject({ kind: 'review', output: 'ok' });
});
