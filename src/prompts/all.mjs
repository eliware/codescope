export function createAllPrompt(profilePrompt) {
  return profilePrompt(
    "Review the full supplied repository context and find every distinct actionable issue. Do not return a sample.",
  );
}
