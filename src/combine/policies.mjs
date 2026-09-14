import path from 'node:path';

const SUPPORTED_PLATFORMS = new Set(['linux', 'darwin', 'freebsd', 'win32']);

export function validateCombineOptions(root, { concurrency, maxChars, platform }) {
  if (!SUPPORTED_PLATFORMS.has(platform))
    throw new Error(`Unsupported combine platform: ${platform}`);
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('File read concurrency must be a positive integer');
  if (
    typeof maxChars !== 'number' ||
    Number.isNaN(maxChars) ||
    !(maxChars > 0) ||
    (maxChars !== Number.POSITIVE_INFINITY && !Number.isInteger(maxChars))
  )
    throw new Error('maxChars must be a positive integer or Infinity');
  const windowsRoot =
    path.win32.isAbsolute(root) &&
    (/^[A-Za-z]:[\\/]/u.test(root) || root.startsWith('\\\\') || root.startsWith('//'));
  if (platform !== 'win32' && windowsRoot)
    throw new Error('Windows-style source roots require a Windows host');
}
