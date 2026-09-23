export function isIncludedJson(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const lower = normalized.toLowerCase();
  if (!lower.endsWith('.json') || lower === 'package.json' || lower === 'package-lock.json') return false;
  if (!normalized.includes('/')) return true;
  return ['docs/', 'specs/'].some((directory) => lower.startsWith(directory));
}
