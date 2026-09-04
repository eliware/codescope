function usageCount(usage, key) {
  const value = usage?.[key] ?? 0;
  if (!Number.isInteger(value) || value < 0) {
    const error = new Error(`Invalid usage field: ${key}`);
    error.code = 'INVALID_USAGE';
    throw error;
  }
  return value;
}

export function normalizeUsage(usage = {}) {
  if (!usage || typeof usage !== 'object') {
    const error = new Error('Usage must be an object');
    error.code = 'INVALID_USAGE';
    throw error;
  }
  const input = usageCount(usage, 'input_tokens');
  const cachedInput = usageCount(usage.input_tokens_details, 'cached_tokens');
  const cacheWrite = usageCount(usage.input_tokens_details, 'cache_write_tokens');
  const output = usageCount(usage, 'output_tokens');
  if (cachedInput + cacheWrite > input) {
    const error = new Error('Cached usage cannot exceed input usage');
    error.code = 'INVALID_USAGE';
    throw error;
  }
  return { input, cachedInput, cacheWrite, output };
}
