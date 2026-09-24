import { open } from "node:fs/promises";

const READ_CHUNK_BYTES = 64 * 1024;

export async function readFileUpToLimit(filePath, maxBytes) {
  const handle = await open(filePath, "r");
  try {
    return await readHandleUpToLimit(handle, maxBytes);
  } finally {
    await handle.close();
  }
}

export async function readHandleUpToLimit(handle, maxBytes) {
  const chunks = [];
  const targetBytes = maxBytes + 1;
  let length = 0;
  while (length < targetBytes) {
    const buffer = Buffer.alloc(Math.min(READ_CHUNK_BYTES, targetBytes - length));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
    if (bytesRead === 0) break;
    chunks.push(buffer.subarray(0, bytesRead));
    length += bytesRead;
  }
  return { data: Buffer.concat(chunks, length), truncated: length > maxBytes };
}
