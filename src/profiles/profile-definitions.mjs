import { REVIEW_CATEGORIES } from '../prompts/categories.mjs';

export const PROFILE_DEFINITIONS = Object.freeze({
  conventions: { files: [true, true, true] },
  refactor: { files: [true, false, false], suggestions: ['architecture'] },
  architecture: { files: [true, false, false], suggestions: ['architecture'] },
  'new-features': { files: [true, false, false], suggestions: ['new-features'] },
  all: { files: [true, true, true] },
  release: { files: [true, true, true] },
  security: { files: [true, false, false], suggestions: ['security'] },
  performance: { files: [true, false, false], suggestions: ['performance'] },
  reliability: { files: [true, false, false], suggestions: ['reliability'] },
  'api-design': { files: [true, false, false], suggestions: ['api_design'] },
  'cross-platform': { files: [true, false, false], suggestions: ['cross_platform'] },
  dependencies: { files: [true, false, false], suggestions: ['reliability'] },
  observability: { files: [true, false, false], suggestions: ['reliability'] },
  accessibility: { files: [true, false, false], suggestions: ['correctness'] },
  'quick-wins': { files: [true, false, false], suggestions: REVIEW_CATEGORIES },
  prioritize: { files: [true, false, false], suggestions: REVIEW_CATEGORIES },
  p0: { files: [true, false, false] },
  'p0-1': { files: [true, false, false] },
  'p0-2': { files: [true, false, false] },
  'p0-3': { files: [true, false, false] },
});

export const PROFILE_FILES = Object.freeze(
  Object.fromEntries(Object.entries(PROFILE_DEFINITIONS).map(([name, definition]) => [name, definition.files])),
);

export const PROFILE_NAMES = Object.freeze(Object.keys(PROFILE_FILES));

export function getProfileFiles(profile) {
  if (!Object.hasOwn(PROFILE_FILES, profile))
    throw new Error(`Unknown analysis profile: ${profile}`);
  return PROFILE_FILES[profile];
}

export function getSuggestionCategories(profile) {
  return PROFILE_DEFINITIONS[profile]?.suggestions;
}
