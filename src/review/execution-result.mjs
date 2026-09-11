export function resolveResultCode(result) {
  if (Number.isInteger(result.code)) return result.code;
  return 'unknown';
}

export function normalizeExecutionResult(result, _isDefaultExecutor) {
  return {
    ...result,
    code: result.code === undefined ? 'unknown' : result.code,
  };
}
