export function resolveResultCode(result) {
  if (Number.isInteger(result.code)) return result.code;
  return 'unknown';
}

export function normalizeExecutionResult(result, isDefaultExecutor) {
  return {
    ...result,
    code: result.code === undefined ? (isDefaultExecutor ? 0 : 'unknown') : result.code,
  };
}
