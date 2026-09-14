import { writeFallbackResult } from './output.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';

export async function throwSessionFailure({
  cause,
  providerResponse,
  providerResponseReceived,
  write,
  createFailure = createProviderFailure,
}) {
  let incomplete;
  try {
    incomplete = createIncompleteResult(cause, providerResponseReceived ? providerResponse : undefined);
  } catch {
    incomplete = { issues: 'not submitted', suggestions: 'not submitted', error: 'Failure details unavailable' };
  }
  const fallbackError = await writeFallbackResult(write, incomplete);
  const failure = createFailure(cause);
  if (cause?.code) failure.code = cause.code;
  failure.result = incomplete;
  if (fallbackError) failure.fallbackError = fallbackError;
  throw failure;
}
