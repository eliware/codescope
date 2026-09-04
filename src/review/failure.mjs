export function createProviderFailure(cause) {
  return new Error(
    `OpenAI request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    { cause },
  );
}

export function createIncompleteResult(cause) {
  return {
    issues: 'not submitted',
    suggestions: 'not submitted',
    error: cause instanceof Error ? cause.message : String(cause),
  };
}
