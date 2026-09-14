import { open } from 'node:fs/promises';

const READ_CHUNK_BYTES = 64 * 1024;

export async function readFileUpToLimit(filePath, maxBytes) {
  const handle = await open(filePath, 'r');
  const chunks = [];
  const targetBytes = maxBytes + 1;
  let length = 0;
  try {
    while (length < targetBytes) {
      const buffer = Buffer.alloc(Math.min(READ_CHUNK_BYTES, targetBytes - length));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      chunks.push(buffer.subarray(0, bytesRead));
      length += bytesRead;
    }
  } finally {
    await handle.close();
  }
  return { data: Buffer.concat(chunks, length), truncated: length > maxBytes };
}
