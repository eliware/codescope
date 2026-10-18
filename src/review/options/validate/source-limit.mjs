export function validateSourceLimit(maxSourceChars) {
  if (
    maxSourceChars !== Infinity &&
    (!Number.isFinite(maxSourceChars) || !Number.isInteger(maxSourceChars) || maxSourceChars < 1)
  )
    throw new Error("runReview maxSourceChars must be a positive integer or Infinity");
}
