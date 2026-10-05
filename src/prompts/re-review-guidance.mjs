export function createReviewFollowUpInstructions() {
  return `Double-check the preceding review.
For each issue, classify it as real, partially real, or false-positive.
Omit any false-positives.
Correct partially real issues.
Return only real issues.`;
}
