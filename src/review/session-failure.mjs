import { writeFallbackResult } from './output.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';

export async function throwSessionFailure({
  cause,
  providerResponse,
  providerResponseReceived,
  write,
}) {
  const incomplete = createIncompleteResult(
    cause,
    providerResponseReceived ? providerResponse : undefined,
  );
  const fallbackError = await writeFallbackResult(write, incomplete);
  const failure = createProviderFailure(cause);
  if (cause?.code) failure.code = cause.code;
  failure.result = incomplete;
  if (fallbackError) failure.fallbackError = fallbackError;
  throw failure;
}
