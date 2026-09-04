export const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'coverage', '.nyc_output']);
const ROOT_ONLY_GENERATED_DIRECTORIES = new Set(['coverage', '.nyc_output']);
export { isCodeExtension, matchesFile, TEST_FILE_PATTERN } from './extensions.mjs';

export function isIgnoredDirectory(name, relativeDirectory = '') {
  const normalizedName = name.toLowerCase();
  if (ROOT_ONLY_GENERATED_DIRECTORIES.has(normalizedName) && relativeDirectory !== '') return false;
  return [...IGNORED_DIRECTORIES].some((ignored) => ignored.toLowerCase() === normalizedName);
}
