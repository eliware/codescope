export function createProviderFailure(cause) {
  return new Error(
    `OpenAI request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    { cause },
  );
}
