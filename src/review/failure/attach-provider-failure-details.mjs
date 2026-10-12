import { ResponsesError, eventErrorDetails } from "@eliware/openai";

export function attachProviderFailureDetails(failure, { cause }) {
  const responseError = cause instanceof ResponsesError ? cause : undefined;
  const eventDetails = eventErrorDetails(responseError?.event ?? cause?.event);
  for (const field of ["code", "type", "status", "parameter", "requestId"]) {
    const value = responseError?.[field] ?? cause?.[field] ?? eventDetails[field];
    if (value !== undefined) failure[field] = value;
  }
  return failure;
}
