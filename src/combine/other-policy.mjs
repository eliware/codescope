const CODE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts'];

export const MAX_OTHER_FILE_BYTES = 2_000_000;

export function isIncludedContent(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower === 'package.json' || lower.endsWith('.md')) return true;
  if (lower.startsWith('.github/') || lower.startsWith('.knit/')) return true;
  return CODE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
