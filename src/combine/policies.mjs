export function validateCombineOptions(root, { concurrency, maxChars, platform }) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('File read concurrency must be a positive integer');
  if (
    typeof maxChars !== 'number' ||
    Number.isNaN(maxChars) ||
    !(maxChars > 0) ||
    (maxChars !== Number.POSITIVE_INFINITY && !Number.isInteger(maxChars))
  )
    throw new Error('maxChars must be a positive integer or Infinity');
  if (platform !== 'win32' && /^(?:[A-Za-z]:[\\/]|\\\\|\/\/)/u.test(root))
    throw new Error('Windows-style source roots require a Windows host');
}
