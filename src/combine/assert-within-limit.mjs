export function assertWithinLimit(totalChars, maxChars) {
  if (totalChars > maxChars)
    throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
}
