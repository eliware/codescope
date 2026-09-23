import path from 'node:path';
import { isIncludedContent, MAX_OTHER_FILE_BYTES } from './other-policy.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';
import { readBatches } from './batches.mjs';
import { readInventoryEntry } from './inventory/read-entry.mjs';
import { selectInventoryFiles } from './inventory/paths.mjs';

const defaultReadOtherFileContents = (filePath) =>
  readFileUpToLimit(filePath, MAX_OTHER_FILE_BYTES);

export async function describeOtherFiles(
  root,
  inventory,
  {
    readOtherFileContents = defaultReadOtherFileContents,
    inspectFile,
    concurrency = 8,
    platform = process.platform,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Other-file read concurrency must be a positive integer');
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  const paths = selectInventoryFiles(root, inventory, pathApi, isIncludedContent);
  const entries = await readBatches(paths, {
    batchSize: concurrency,
    maxChars: Infinity,
    read: (relativePath) => readInventoryEntry(rootPath, relativePath, { pathApi, readOtherFileContents, inspectFile }),
  });
  return entries.filter(Boolean);
}

export { resolveInventoryPath } from './inventory/paths.mjs';
