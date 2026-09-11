import { writeFallbackResult } from './output.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';

export async function throwSessionFailure({
  cause,
  providerResponse,
  providerResponseReceived,
  write,
}) {
  const incomplete = providerResponseReceived
    ? createIncompleteResult(cause, providerResponse)
    : undefined;
  const fallbackError = incomplete ? await writeFallbackResult(write, incomplete) : undefined;
  const failure = createProviderFailure(cause);
  if (cause?.code) failure.code = cause.code;
  if (incomplete) failure.result = incomplete;
  if (fallbackError) failure.fallbackError = fallbackError;
  throw failure;
}
