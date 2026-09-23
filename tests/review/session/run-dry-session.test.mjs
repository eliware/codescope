import { runDrySession } from '../../../src/review/session/run-dry-session.mjs';

test('runs and writes a dry session', async () => {
  await expect(runDrySession({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request: { model: 'gpt-5.6-sol' },
    signal: undefined,
    usage: false,
    write: async (value) => ({ written: value.length }),
  })).resolves.toMatchObject({ kind: 'dry-run' });
});

