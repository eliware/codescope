import { PROFILE_DEFINITIONS } from './profile-definitions.mjs';

export const PROFILE_FILES = Object.freeze(
  Object.fromEntries(Object.entries(PROFILE_DEFINITIONS).map(([name, definition]) => [name, definition.files])),
);

export const PROFILE_NAMES = Object.freeze(Object.keys(PROFILE_FILES));

export function getProfileFiles(profile) {
  if (!Object.hasOwn(PROFILE_FILES, profile))
    throw new Error(`Unknown analysis profile: ${profile}`);
  return PROFILE_FILES[profile];
}
