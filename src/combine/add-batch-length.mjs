export function addBatchLength(totalChars, sectionsLength, batchLength) {
  return totalChars + sectionsLength + (totalChars > 0 ? 1 : 0) + Math.max(0, batchLength - 1);
}
