export const TEST_FILE_PATTERN = /\.test\.(?:js|cjs|mjs|ts)$/iu;

export function isCodeExtension(extension) {
  return (
    ['.js', '.cjs', '.mjs', '.ts'].includes(extension) ||
    (Array.isArray(extension) && extension.some((value) => ['.js', '.cjs', '.mjs'].includes(value)))
  );
}

export function matchesFile(name, extension, testsOnly, noTests) {
  const extensionMatches =
    extension === '' ||
    (Array.isArray(extension)
      ? extension.some((value) => name.toLowerCase().endsWith(value))
      : name.toLowerCase().endsWith(extension));
  if (!extensionMatches) return false;
  if (!isCodeExtension(extension)) return true;
  return (
    (testsOnly && TEST_FILE_PATTERN.test(name)) ||
    (!testsOnly && !(noTests && TEST_FILE_PATTERN.test(name)))
  );
}
