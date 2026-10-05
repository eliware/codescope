export const TEST_FILE_PATTERN = /\.test\.(?:js|cjs|mjs|ts)$/iu;

export function isCodeExtension(extension) {
  return (
    [".js", ".cjs", ".mjs", ".ts"].includes(extension) ||
    (Array.isArray(extension) &&
      extension.some((value) => [".js", ".cjs", ".mjs", ".ts"].includes(value.toLowerCase())))
  );
}

export function matchesFile(name, extension, testsOnly, noTests) {
  if (
    name.toLowerCase() === "release_notes.md" &&
    typeof extension === "string" &&
    extension.toLowerCase() === ".md"
  )
    return false;
  const extensionMatches =
    extension === "" ||
    (Array.isArray(extension)
      ? extension.some((value) => name.toLowerCase().endsWith(value.toLowerCase()))
      : name.toLowerCase().endsWith(extension.toLowerCase()));
  if (!extensionMatches) return false;
  if (!isCodeExtension(extension)) return true;
  return (
    (testsOnly && TEST_FILE_PATTERN.test(name)) ||
    (!testsOnly && !(noTests && TEST_FILE_PATTERN.test(name)))
  );
}
