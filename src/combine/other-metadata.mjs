export function formatOtherFile(relativePath, bytes) {
  if (bytes.includes(0)) return `${relativePath} | binary | ${bytes.byteLength} bytes`;
  const text = bytes.toString('utf8');
  return `${relativePath} | text | ${text.split(/\r\n|\r|\n/u).length} lines | ${bytes.byteLength} bytes`;
}
