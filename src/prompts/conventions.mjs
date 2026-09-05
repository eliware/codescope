import { conventionPolicy } from './policy/conventions.mjs';

export function createConventionPrompt(profilePrompt) {
  return profilePrompt(
    `${conventionPolicy}\n\nPerform a complete convention and artifact-quality review over all supplied implementation, test, documentation, configuration, metadata, and inventory evidence. Keep documentation semantic-quality findings distinct from deterministic file-existence or structural enforcement.`,
  );
}
