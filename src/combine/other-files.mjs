import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { isIncludedContent, MAX_OTHER_FILE_BYTES } from './other-policy.mjs';
import { formatOtherFile } from './other-metadata.mjs';

export async function describeOtherFiles(
  root,
  inventory,
  { readFileContents = readFile, statFile = readFileContents === readFile ? stat : undefined } = {},
) {
  const paths = inventory.filter((relativePath) => !isIncludedContent(relativePath));
  const entries = [];
  let totalBytes = 0;
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const relativePath = paths[next++];
      const filePath = path.join(root, relativePath);
      let reservedBytes = 0;
      if (statFile) {
        const size = (await statFile(filePath)).size;
        if (totalBytes + size > MAX_OTHER_FILE_BYTES) {
          entries.push(
            `${relativePath} | omitted | ${size} bytes | aggregate metadata budget exceeded`,
          );
          continue;
        }
        totalBytes += size;
        reservedBytes = size;
      }
      const data = await readFileContents(filePath);
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
      const actualTotalBytes = totalBytes - reservedBytes + bytes.byteLength;
      if (actualTotalBytes > MAX_OTHER_FILE_BYTES) {
        entries.push(
          `${relativePath} | omitted | ${bytes.byteLength} bytes | aggregate metadata budget exceeded`,
        );
        continue;
      }
      totalBytes = actualTotalBytes;
      entries.push(formatOtherFile(relativePath, bytes));
    }
  };
  const workerCount = paths.length ? 1 : 0;
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}
