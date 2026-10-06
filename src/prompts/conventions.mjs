import { conventionPolicy } from "./policy/conventions.mjs";

export function createConventionPrompt(profilePrompt) {
  return profilePrompt(
    `${conventionPolicy}\n\nReview all supplied code, tests, docs, configuration, metadata, JSON, and file names against Eliware Test rules. Review formatting and meaning. Do not replace the formatter checks run by @eliware/test. Report content and meaning issues separately from file-name or structure checks.`,
  );
}
