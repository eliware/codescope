import { redactTestOutput } from './redaction.mjs';

export function createProviderFailure(cause) {
  return new Error(
    `OpenAI request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    { cause },
  );
}

function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  try {
    JSON.stringify(response);
    return {
      ...(typeof response.output_text === 'string'
        ? { output_text: redactTestOutput(response.output_text) }
        : {}),
      ...(response.usage && typeof response.usage === 'object'
        ? {
            usage: Object.fromEntries(
              Object.entries(response.usage).filter(([, value]) => Number.isFinite(value)),
            ),
          }
        : {}),
      response_error: 'Provider response was not accepted by the response contract',
    };
  } catch {
    try {
      return {
        output_text:
          typeof response.output_text === 'string'
            ? redactTestOutput(response.output_text)
            : undefined,
        response_error: 'Provider response could not be serialized',
      };
    } catch {
      return { response_error: 'Provider response could not be serialized' };
    }
  }
}

export function createIncompleteResult(cause, providerResponse) {
  const result = {
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: cause instanceof Error ? cause.message : String(cause),
  };
  const response = preserveProviderResponse(providerResponse);
  if (response !== undefined) result.response = response;
  return result;
}
