import { open } from 'node:fs/promises';

export async function readFileUpToLimit(filePath, maxBytes) {
  const handle = await open(filePath, 'r');
  const buffer = Buffer.alloc(maxBytes + 1);
  let length = 0;
  try {
    while (length < buffer.length) {
      const { bytesRead } = await handle.read(buffer, length, buffer.length - length, null);
      if (bytesRead === 0) break;
      length += bytesRead;
    }
  } finally {
    await handle.close();
  }
  return { data: buffer.subarray(0, length), truncated: length > maxBytes };
}
