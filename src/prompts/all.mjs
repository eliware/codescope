export function createAllPrompt(profilePrompt) {
  return profilePrompt(
    "Review all supplied repository content. Report every separate defect that meets the review rules. Do not return a sample.",
  );
}
