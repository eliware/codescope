import { runReviewSession } from '../../src/review/run-session.mjs';

const request = { model: 'gpt-5.6-luna', tool_choice: { name: 'submit_review' } };
const write = async (value) => ({ written: value.length });

test('routes a provider session through the output boundary', async () => {
  await expect(runReviewSession({
    client: { responses: { create: async () => ({
      output: [{ type: 'function_call', name: 'submit_review', arguments: '{}' }],
    }) } },
    request,
    signal: new AbortController().signal,
    write,
    dryRun: false,
    usage: false,
  })).resolves.toMatchObject({ kind: 'review', output: '{}' });
});

test('routes dry-run requests to the dry session', async () => {
  await expect(runReviewSession({
    client: { responses: { create: async () => ({ output_text: 'unused' }), inputTokens: { count: async () => ({ input_tokens: 1 }) } } },
    request,
    signal: new AbortController().signal,
    write,
    dryRun: true,
    usage: false,
  })).resolves.toMatchObject({ kind: 'dry-run' });
});

test('converts provider failures through the session failure boundary', async () => {
  await expect(runReviewSession({
    client: { responses: { create: async () => { throw new Error('provider failed'); } } },
    request,
    signal: new AbortController().signal,
    write,
    dryRun: false,
    usage: false,
  })).rejects.toMatchObject({ message: 'OpenAI request failed: provider failed' });
});
