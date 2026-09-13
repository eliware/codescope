import path from 'node:path';
import { isIncludedContent, MAX_OTHER_FILE_BYTES } from './other-policy.mjs';
import { formatOtherFile } from './other-metadata.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';

export async function describeOtherFiles(
  root,
  inventory,
  { readFileContents = (filePath) => readFileUpToLimit(filePath, MAX_OTHER_FILE_BYTES) } = {},
) {
  const paths = inventory.filter((relativePath) => !isIncludedContent(relativePath));
  const entries = [];
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const relativePath = paths[next++];
      const filePath = path.join(root, relativePath);
      const data = await readFileContents(filePath);
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
      if (bytes.byteLength > MAX_OTHER_FILE_BYTES) {
        entries.push(
          `${relativePath} | omitted | ${bytes.byteLength} bytes | per-file metadata limit exceeded`,
        );
        continue;
      }
      entries.push(formatOtherFile(relativePath, bytes));
    }
  };
  const workerCount = paths.length ? 1 : 0;
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}
