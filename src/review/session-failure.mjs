import { writeFallbackResult } from './output/write-fallback-output.mjs';
import { createIncompleteResult } from './incomplete-result.mjs';
import { createProviderFailure } from './provider-failure.mjs';

export async function throwSessionFailure({
  cause,
  providerResponse,
  providerResponseReceived,
  write,
  createFailure = createProviderFailure,
  fallbackCause = cause,
}) {
  let incomplete;
  try {
    incomplete = createIncompleteResult(fallbackCause, providerResponseReceived ? providerResponse : undefined);
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
