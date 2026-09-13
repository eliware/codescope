import { createReadStream } from 'node:fs';

const READ_CHUNK_BYTES = 64 * 1024;

export async function readFileUpToLimit(filePath, maxBytes) {
  const chunks = [];
  let length = 0;
  for await (const chunk of createReadStream(filePath, {
    highWaterMark: Math.min(maxBytes + 1, READ_CHUNK_BYTES),
  })) {
    const accepted = chunk.subarray(0, maxBytes + 1 - length);
    chunks.push(accepted);
    length += accepted.byteLength;
    if (length > maxBytes) break;
  }
  return { data: Buffer.concat(chunks, length), truncated: length >= maxBytes };
}
