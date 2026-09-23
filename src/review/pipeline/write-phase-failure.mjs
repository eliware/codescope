import { throwSessionFailure } from '../session-failure.mjs';

export function writePhaseFailure({ cause, write, createFailure, fallbackCause, hasProviderResponse = false }) {
  return throwSessionFailure({
    cause,
    providerResponse: cause.providerResponse,
    providerResponseReceived: hasProviderResponse || cause.providerResponse !== undefined,
    write,
    createFailure,
    fallbackCause,
  });
}
