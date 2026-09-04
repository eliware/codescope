import { calculateUsageCost } from '../pricing/calculator.mjs';

export async function runDryRun({ client, request, signal, model, usage }) {
  const {
    store: _store,
    include: _include,
    prompt_cache_options: _cacheOptions,
    service_tier: _serviceTier,
    ...tokenRequest
  } = request;
  if (typeof client.responses?.inputTokens?.count !== 'function') {
    const error = new Error('OpenAI client does not support input-token counting');
    error.code = 'API';
    throw error;
  }
  const tokenResponse = await client.responses.inputTokens.count(tokenRequest, { signal });
  if (!Number.isInteger(tokenResponse?.input_tokens) || tokenResponse.input_tokens < 0) {
    const error = new Error('Invalid input-token count response');
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
  const output = { model, estimated_input_tokens: tokenResponse.input_tokens };
  if (usage) {
    output.usage = {
      input_tokens: tokenResponse.input_tokens,
      estimated_cost_usd: calculateUsageCost(model ?? 'gpt-5.6-luna', {
        input_tokens: tokenResponse.input_tokens,
      }),
    };
  }
  return output;
}
