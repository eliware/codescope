export function getBatchSize(maxChars, concurrency) {
  return Number.isFinite(maxChars) ? 1 : concurrency;
}

export function addBatchLength(totalChars, sectionsLength, batchLength) {
  return totalChars + sectionsLength + (totalChars > 0 ? 1 : 0) + Math.max(0, batchLength - 1);
}

export function assertWithinLimit(totalChars, maxChars) {
  if (totalChars > maxChars)
    throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
}
