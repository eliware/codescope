export function createEnvironmentReader(content) {
  let bytes;
  let position = 0;
  return async (buffer, offset, length) => {
    if (!bytes) {
      const resolved = await resolveContent(content);
      bytes = Buffer.isBuffer(resolved) ? resolved : Buffer.from(resolved);
    }
    const bytesRead = Math.min(length, bytes.byteLength - position);
    bytes.copy(buffer, offset, position, position + bytesRead);
    position += bytesRead;
    return { bytesRead };
  };
}

async function resolveContent(content) {
  return typeof content === "function" ? content() : content;
}
