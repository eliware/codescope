import { runDrySession } from '../../../src/review/session/run-dry-session.mjs';
import { runReviewSession } from '../../../src/review/run-session.mjs';

test('runs and writes a dry session', async () => {
  await expect(runDrySession({
    client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request: { model: 'gpt-5.6-sol' },
    signal: undefined,
    usage: false,
    write: async (value) => ({ written: value.length }),
  })).resolves.toMatchObject({ kind: 'dry-run' });
});

test('runs dry-run and preserves provider failures', async () => {
  await expect(
    runReviewSession({
      client: { responses: { inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
      request: { model: 'gpt-5.6-luna', input: [], tools: [] },
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: true,
      usage: false,
    }),
  ).resolves.toMatchObject({ output: { estimated_input_tokens: 1 } });
  const failure = Object.assign(new Error('provider down'), { code: 'API' });
  await expect(
    runReviewSession({
      client: { responses: { create: async () => { throw failure; } } },
      request: { model: 'gpt-5.6-luna' },
      signal: new AbortController().signal,
      write: async (value) => ({ written: value.length }),
      dryRun: false,
      usage: false,
    }),
  ).rejects.toMatchObject({ code: 'API' });
});
