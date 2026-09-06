import { conventionPolicy } from './policy/conventions.mjs';

export function createConventionPrompt(profilePrompt) {
  return profilePrompt(
    `${conventionPolicy}\n\nPerform a complete Convention v6.2 review over all supplied implementation, test, documentation, configuration, metadata, and inventory evidence. Review formatter compliance and semantic quality, but do not replace deterministic formatter checks owned by @eliware/test. Keep documentation semantic-quality findings distinct from deterministic file-existence or structural enforcement.`,
  );
}
