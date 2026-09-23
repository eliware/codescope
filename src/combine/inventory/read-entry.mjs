import { lstat } from 'node:fs/promises';
import { MAX_OTHER_FILE_BYTES } from '../other-policy.mjs';
import { formatOtherFile } from '../other-metadata.mjs';
import { resolveInventoryPath } from './paths.mjs';

export async function readInventoryEntry(rootPath, relativePath, { pathApi, readOtherFileContents, inspectFile }) {
  const filePath = resolveInventoryPath(rootPath, relativePath, pathApi);
  const metadata = await (inspectFile ?? lstat)(filePath);
  if (metadata.isSymbolicLink()) throw new Error(`symlinked inventory files are not supported: ${relativePath}`);
  if (!metadata.isFile()) throw new Error(`inventory path is not a regular file: ${relativePath}`);
  const result = await readOtherFileContents(filePath);
  if (!result || typeof result !== 'object' || !('data' in result) || typeof result.truncated !== 'boolean') throw new Error('Other-file reader must return { data, truncated }');
  const bytes = Buffer.isBuffer(result.data) ? result.data : Buffer.from(String(result.data));
  if (bytes.byteLength > MAX_OTHER_FILE_BYTES + 1) throw new Error(`Other-file reader exceeded the ${MAX_OTHER_FILE_BYTES + 1}-byte sample boundary`);
  if (bytes.byteLength > MAX_OTHER_FILE_BYTES && result.truncated !== true) throw new Error('Other-file reader returned oversized data without truncated=true');
  if (result.truncated === true && bytes.byteLength <= MAX_OTHER_FILE_BYTES) throw new Error('Other-file reader marked an in-limit sample as truncated');
  if (result.truncated === true) return `${relativePath} | omitted | at least ${bytes.byteLength} sampled bytes | per-file metadata limit reached`;
  return formatOtherFile(relativePath, bytes);
}
