export function formatOtherFile(relativePath, bytes) {
  if (bytes.includes(0)) return `${relativePath} | binary | ${bytes.byteLength} bytes`;
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return `${relativePath} | binary | ${bytes.byteLength} bytes`;
  }
  return `${relativePath} | text | ${text.split(/\r\n|\r|\n/u).length} lines | ${bytes.byteLength} bytes`;
}
