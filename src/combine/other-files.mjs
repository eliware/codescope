import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const CODE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts'];
const MAX_OTHER_FILE_BYTES = 2_000_000;

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
      if (!reservedBytes && totalBytes + bytes.byteLength > MAX_OTHER_FILE_BYTES) {
        entries.push(
          `${relativePath} | omitted | ${bytes.byteLength} bytes | aggregate metadata budget exceeded`,
        );
        continue;
      }
      if (!reservedBytes) totalBytes += bytes.byteLength;
      if (bytes.includes(0)) entries.push(`${relativePath} | binary | ${bytes.byteLength} bytes`);
      else {
        const text = bytes.toString('utf8');
        entries.push(
          `${relativePath} | text | ${text.split(/\r\n|\r|\n/u).length} lines | ${bytes.byteLength} bytes`,
        );
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(16, paths.length) }, worker));
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}

function isIncludedContent(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower === 'package.json' || lower.endsWith('.md')) return true;
  if (lower.startsWith('.github/') || lower.startsWith('.knit/')) return true;
  return CODE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
