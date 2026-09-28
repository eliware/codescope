export function attachProviderFailureDetails(failure, { cause, result, fallbackError }) {
  if (cause?.code) failure.code = cause.code;
  failure.result = result;
  if (fallbackError) failure.fallbackError = fallbackError;
  return failure;
}
