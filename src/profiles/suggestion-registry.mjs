import { PROFILE_DEFINITIONS } from './profile-definitions.mjs';

export const suggestionCategories = Object.freeze(
  Object.fromEntries(
    Object.entries(PROFILE_DEFINITIONS)
      .filter(([, definition]) => definition.suggestions)
      .map(([name, definition]) => [name, definition.suggestions]),
  ),
);
