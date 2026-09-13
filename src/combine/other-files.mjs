import path from 'node:path';
import { isIncludedContent, MAX_OTHER_FILE_BYTES } from './other-policy.mjs';
import { formatOtherFile } from './other-metadata.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';

export async function describeOtherFiles(
  root,
  inventory,
  {
    readOtherFileContents = (filePath) => readFileUpToLimit(filePath, MAX_OTHER_FILE_BYTES),
    concurrency = 8,
  } = {},
) {
  const paths = inventory.filter((relativePath) => !isIncludedContent(relativePath));
  const entries = [];
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const relativePath = paths[next++];
      const filePath = path.join(root, relativePath);
      const result = await readOtherFileContents(filePath);
      if (
        !result ||
        typeof result !== 'object' ||
        !('data' in result) ||
        typeof result.truncated !== 'boolean'
      )
        throw new Error('Other-file reader must return { data, truncated }');
      const bytes = Buffer.isBuffer(result.data) ? result.data : Buffer.from(String(result.data));
      if (result.truncated === true || bytes.byteLength > MAX_OTHER_FILE_BYTES) {
        entries.push(
          `${relativePath} | omitted | ${bytes.byteLength} bytes | per-file metadata limit exceeded`,
        );
        continue;
      }
      entries.push(formatOtherFile(relativePath, bytes));
    }
  };
  const workerCount = Math.min(paths.length, Math.max(1, concurrency));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}
