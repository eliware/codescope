import { conventionPolicy } from './policy/conventions.mjs';

export function createConventionPrompt(profilePrompt) {
  return profilePrompt(
    `${conventionPolicy}\n\nPerform a complete Convention v8 review over all supplied implementation, test, documentation, configuration, metadata, JSON, and inventory evidence. Review formatter compliance and semantic quality, but do not replace deterministic formatter checks owned by @eliware/test. Keep documentation semantic-quality findings distinct from deterministic file-existence or structural enforcement.`,
  );
}
