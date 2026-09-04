import { runDryRun } from '../../src/review/dry-run.mjs';

const request = { model: 'gpt-5.6-luna', input: [], tools: [], store: false, include: [] };

test('counts input tokens and optionally calculates cost', async () => {
  const client = { responses: { inputTokens: { count: async (value) => { expect(value.store).toBeUndefined(); return { input_tokens: 42 }; } } } };
  await expect(runDryRun({ client, request, signal: {}, model: request.model, usage: true })).resolves.toMatchObject({ estimated_input_tokens: 42, usage: { input_tokens: 42 } });
});

test('rejects unsupported clients and invalid counts', async () => {
  await expect(runDryRun({ client: {}, request, signal: {}, model: request.model, usage: false })).rejects.toMatchObject({ code: 'API' });
  const client = { responses: { inputTokens: { count: async () => ({ input_tokens: -1 }) } } };
  await expect(runDryRun({ client, request, signal: {}, model: request.model, usage: false })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});
