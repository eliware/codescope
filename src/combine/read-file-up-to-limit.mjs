import { createReadStream } from 'node:fs';

export async function readFileUpToLimit(filePath, maxBytes) {
  const chunks = [];
  let length = 0;
  for await (const chunk of createReadStream(filePath, { highWaterMark: maxBytes + 1 })) {
    const accepted = chunk.subarray(0, maxBytes + 1 - length);
    chunks.push(accepted);
    length += accepted.byteLength;
    if (length > maxBytes) break;
  }
  return { data: Buffer.concat(chunks, length), truncated: length > maxBytes };
}
