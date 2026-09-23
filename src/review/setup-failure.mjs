export function createSetupFailure(cause) {
  let message;
  try {
    message = cause instanceof Error ? cause.message : String(cause);
  } catch {
    message = 'failure details unavailable';
  }
  return new Error(`CodeScope setup failed: ${message}`, { cause });
}
