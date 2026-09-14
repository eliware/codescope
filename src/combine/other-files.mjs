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
    platform = process.platform,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Other-file read concurrency must be a positive integer');
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  for (const relativePath of inventory)
    if (typeof relativePath !== 'string') throw new Error('Inventory paths must be strings');
  const paths = inventory
    .map((relativePath) => relativePath.replaceAll('\\', '/'))
    .map((relativePath) => {
      resolveInventoryPath(rootPath, relativePath, pathApi);
      return relativePath;
    })
    .filter((relativePath) => !isIncludedContent(relativePath))
    .sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
  const entries = Array.from({ length: paths.length });
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const index = next++;
      const relativePath = paths[index];
      const filePath = resolveInventoryPath(rootPath, relativePath, pathApi);
      const inspect = inspectFile ?? lstat;
      const metadata = await inspect(filePath);
      if (metadata.isSymbolicLink())
        throw new Error(`symlinked inventory files are not supported: ${relativePath}`);
      if (!metadata.isFile()) throw new Error(`inventory path is not a regular file: ${relativePath}`);
      const result = await readOtherFileContents(filePath);
      if (
        !result ||
        typeof result !== 'object' ||
        !('data' in result) ||
        typeof result.truncated !== 'boolean'
      )
        throw new Error('Other-file reader must return { data, truncated }');
      const bytes = Buffer.isBuffer(result.data) ? result.data : Buffer.from(String(result.data));
      if (bytes.byteLength > MAX_OTHER_FILE_BYTES + 1)
        throw new Error(`Other-file reader exceeded the ${MAX_OTHER_FILE_BYTES + 1}-byte sample boundary`);
      if (bytes.byteLength > MAX_OTHER_FILE_BYTES && result.truncated !== true)
        throw new Error('Other-file reader returned oversized data without truncated=true');
      if (result.truncated === true) {
        const sample = bytes.subarray(0, MAX_OTHER_FILE_BYTES + 1);
        entries[index] =
          `${relativePath} | omitted | at least ${sample.byteLength} sampled bytes | per-file metadata limit reached`;
        continue;
      }
      entries[index] = formatOtherFile(relativePath, bytes);
    }
  };
  const workerCount = Math.min(paths.length, Math.max(1, concurrency));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return entries.filter(Boolean);
}

function resolveInventoryPath(rootPath, relativePath, pathApi) {
  const portablePath = relativePath.replaceAll('\\', '/');
  if (
    path.posix.isAbsolute(portablePath) ||
    path.win32.isAbsolute(portablePath) ||
    /^(?:\\\\|\/\/)/u.test(portablePath)
  )
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  const portableRelative = pathApi.normalize(portablePath).replaceAll('\\', '/');
  if (portableRelative === '..' || portableRelative.startsWith('../'))
    throw new Error(`Inventory path escapes review root: ${relativePath}`);
  return pathApi.resolve(rootPath, portableRelative);
}
