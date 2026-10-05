export function isIncludedJson(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const lower = normalized.toLowerCase();
  if (!lower.endsWith(".json") || lower === "package.json" || isPackageLock(lower)) return false;
  return true;
}

export function isPackageLock(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/").toLowerCase();
  return normalized === "package-lock.json" || normalized.endsWith("/package-lock.json");
}
