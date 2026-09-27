import { throwSessionFailure } from "../review-failure.mjs";

export function writePhaseFailure({
  cause,
  write,
  createFailure,
  fallbackCause,
  hasProviderResponse = false,
}) {
  return throwSessionFailure({
    cause,
    providerResponse: cause.providerResponse,
    providerResponseReceived: hasProviderResponse || cause.providerResponse !== undefined,
    write,
    createFailure,
    fallbackCause,
  });
}

export async function runReviewPhase(action, failureOptions) {
  try {
    return await action();
  } catch (cause) {
    return writePhaseFailure({ ...failureOptions, cause });
  }
}
