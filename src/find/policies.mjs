export const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'coverage', '.nyc_output']);
const ROOT_ONLY_GENERATED_DIRECTORIES = new Set(['coverage', '.nyc_output']);
export const TEST_FILE_PATTERN = /\.test\.(?:js|cjs|mjs)$/iu;

export function isCodeExtension(extension) {
  return extension === '.mjs' || (Array.isArray(extension) && extension.some((value) => ['.js', '.cjs', '.mjs'].includes(value)));
}

export function isIgnoredDirectory(name, relativeDirectory = '') {
  const normalizedName = name.toLowerCase();
  if (ROOT_ONLY_GENERATED_DIRECTORIES.has(normalizedName) && relativeDirectory !== '') return false;
  return [...IGNORED_DIRECTORIES].some((ignored) => ignored.toLowerCase() === normalizedName);
}

export function matchesFile(name, extension, testsOnly, noTests) {
  const extensionMatches = extension === '' || (Array.isArray(extension)
    ? extension.some((value) => name.toLowerCase().endsWith(value))
    : name.toLowerCase().endsWith(extension));
  if (!extensionMatches) return false;
  if (!isCodeExtension(extension)) return true;
  return (testsOnly && TEST_FILE_PATTERN.test(name)) || (!testsOnly && !(noTests && TEST_FILE_PATTERN.test(name)));
}
