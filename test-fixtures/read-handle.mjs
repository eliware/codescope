export function createReadHandle(value) {
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
  let offset = 0;
  return {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, data.length - offset);
      data.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
    async readFile(encoding) {
      return data.toString(encoding);
    },
    async close() {},
  };
}
