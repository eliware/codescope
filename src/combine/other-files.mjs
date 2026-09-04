import { readFile } from 'node:fs/promises';
import path from 'node:path';

const CODE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts'];

export async function describeOtherFiles(root, inventory, { readFileContents = readFile } = {}) {
  const entries = await Promise.all(
    inventory
      .filter((relativePath) => !isIncludedContent(relativePath))
      .map(async (relativePath) => {
        const data = await readFileContents(path.join(root, relativePath));
        const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
        if (bytes.includes(0)) return `${relativePath} | binary | ${bytes.byteLength} bytes`;
        const text = bytes.toString('utf8');
        return `${relativePath} | text | ${text.split(/\r\n|\r|\n/u).length} lines | ${bytes.byteLength} bytes`;
      }),
  );
  return entries.sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'variant' }));
}

function isIncludedContent(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower === 'package.json' || lower.endsWith('.md')) return true;
  if (lower.startsWith('.github/') || lower.startsWith('.knit/')) return true;
  return CODE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
