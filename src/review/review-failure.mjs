import { writeFallbackResult } from "./output/write-fallback-output.mjs";
import { createIncompleteResult } from "./incomplete-result.mjs";
import { createProviderFailure } from "./provider-failure.mjs";
import { attachProviderFailureDetails } from "./failure/attach-provider-failure-details.mjs";

export async function throwSessionFailure({
  cause,
  providerResponse,
  providerResponseReceived,
  write,
  createFailure = createProviderFailure,
  fallbackCause = cause,
}) {
  const incomplete = createIncompleteResult(
    fallbackCause,
    providerResponseReceived ? providerResponse : undefined,
  );
  const fallbackError = await writeFallbackResult(write, incomplete);
  const failure = attachProviderFailureDetails(createFailure(cause), {
    cause,
    result: incomplete,
    fallbackError,
  });
  throw failure;
}
