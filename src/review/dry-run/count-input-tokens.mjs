export async function countInputTokens(client, request, signal) {
  const {
    store: _store,
    include: _include,
    prompt_cache_options: _cacheOptions,
    service_tier: _serviceTier,
    ...tokenRequest
  } = request;
  const count = client.responses?.inputTokens?.count;
  if (typeof count !== "function") {
    const error = new Error("OpenAI client does not support input-token counting");
    error.code = "API";
    throw error;
  }
  const response = await count(tokenRequest, { signal });
  if (!Number.isSafeInteger(response?.input_tokens) || response.input_tokens < 0) {
    const error = new Error("Invalid input-token count response");
    error.code = "INVALID_RESPONSE";
    throw error;
  }
  return response.input_tokens;
}
