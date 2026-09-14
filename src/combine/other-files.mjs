import path from 'node:path';
import { lstat } from 'node:fs/promises';
import { isIncludedContent, MAX_OTHER_FILE_BYTES } from './other-policy.mjs';
import { formatOtherFile } from './other-metadata.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';

const defaultReadOtherFileContents = (filePath) =>
  readFileUpToLimit(filePath, MAX_OTHER_FILE_BYTES);

export async function describeOtherFiles(
  root,
  inventory,
  {
    readOtherFileContents = defaultReadOtherFileContents,
    inspectFile,
    concurrency = 8,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Other-file read concurrency must be a positive integer');
  const rootPath = path.resolve(root);
  for (const relativePath of inventory)
    if (typeof relativePath !== 'string') throw new Error('Inventory paths must be strings');
  const paths = inventory
    .map((relativePath) => relativePath.replaceAll('\\', '/'))
    .filter((relativePath) => !isIncludedContent(relativePath));
  const entries = [];
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const relativePath = paths[next++];
      const filePath = resolveInventoryPath(rootPath, relativePath);
      const inspect =
        inspectFile ?? (readOtherFileContents === defaultReadOtherFileContents ? lstat : undefined);
      if (inspect) {
        const metadata = await inspect(filePath);
        if (metadata.isSymbolicLink())
          throw new Error(`symlinked inventory files are not supported: ${relativePath}`);
        if (!metadata.isFile()) throw new Error(`inventory path is not a regular file: ${relativePath}`);
      }
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
        const sampledBytes = Math.min(bytes.byteLength, MAX_OTHER_FILE_BYTES + 1);
        entries.push(
          `${relativePath} | omitted | at least ${sampledBytes} sampled bytes | per-file metadata limit reached`,
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

function resolveInventoryPath(rootPath, relativePath) {
  if (/^(?:[A-Za-z]:[\\/]|\\\\|\/\/)/u.test(relativePath))
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  const normalizedPath = relativePath.replaceAll(/[\\/]/gu, path.sep);
  const filePath = path.resolve(rootPath, normalizedPath);
  const relative = path.relative(rootPath, filePath);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  return filePath;
}
