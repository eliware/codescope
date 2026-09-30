export function isIncludedJson(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const lower = normalized.toLowerCase();
  if (
    !lower.endsWith(".json") ||
    lower === "package.json" ||
    lower.endsWith("/package-lock.json") ||
    lower === "package-lock.json"
  )
    return false;
  return true;
}
