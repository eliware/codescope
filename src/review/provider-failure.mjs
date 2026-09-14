export function createProviderFailure(cause) {
  const message = safeMessage(cause);
  return new Error(
    `OpenAI request failed: ${message}`,
    { cause },
  );
}

function safeMessage(cause) {
  try {
    return cause instanceof Error ? cause.message : String(cause);
  } catch {
    return 'failure details unavailable';
  }
}
