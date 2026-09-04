export const PROFILE_FILES = Object.freeze({
  refactor: [true, false, false], architecture: [true, false, false], 'new-features': [true, false, false], all: [true, true, true], release: [true, true, true],
  security: [true, false, false], performance: [true, false, false], reliability: [true, false, false], 'api-design': [true, false, false],
  'cross-platform': [true, false, false], dependencies: [true, false, false], observability: [true, false, false], accessibility: [true, false, false],
  'quick-wins': [true, false, false], prioritize: [true, false, false], p0: [true, false, false], 'p0-1': [true, false, false],
  'p0-2': [true, false, false], 'p0-3': [true, false, false],
});

export const PROFILE_NAMES = Object.freeze(Object.keys(PROFILE_FILES));

export function getProfileFiles(profile) {
  if (!Object.hasOwn(PROFILE_FILES, profile)) throw new Error(`Unknown analysis profile: ${profile}`);
  return PROFILE_FILES[profile];
}
