import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { readBatches } from './batches.mjs';

const MAX_CONFIG_LINES = 200;

export async function combineConfigFiles(
  root,
  { inventory, readFileContents = readFile, inspectFile, concurrency = 8 } = {},
) {
  const configFiles = inventory.map((relativePath) => relativePath.replaceAll('\\', '/')).filter((relativePath) => {
    const normalized = relativePath.toLowerCase();
    return normalized.startsWith('.github/') || normalized.startsWith('.knit/');
  });
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Configuration concurrency must be a positive integer');
  const sections = await readBatches(configFiles, {
    batchSize: concurrency,
    maxChars: Infinity,
    read: async (relativePath) => {
      const resolvedPath = path.join(root, relativePath);
      const inspect = inspectFile ?? (readFileContents === readFile ? lstat : undefined);
      if (inspect) {
        const metadata = await inspect(resolvedPath);
        if (metadata.isSymbolicLink())
          throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
        if (!metadata.isFile())
          throw new Error(`configuration path is not a regular file: ${relativePath}`);
      }
      const data = await readFileContents(resolvedPath);
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
      if (bytes.includes(0)) return '';
      const text = bytes.toString('utf8');
      const lines = text.replace(/(?:\r\n|\r|\n)$/u, '').split(/\r\n|\r|\n/u);
      const truncated = lines.length > MAX_CONFIG_LINES;
      const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
      const width = String(visibleLines.length).length;
      const body = visibleLines.map(
        (line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`,
      );
      if (truncated)
        body.push(`[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`);
      return `===== ${relativePath} =====\n${body.join('\n')}\n`;
    },
  });
  const included = sections.filter(Boolean);
  return included.length ? `===== repository configuration =====\n${included.join('\n')}` : '';
}
