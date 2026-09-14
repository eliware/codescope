import { lstat } from 'node:fs/promises';
import path from 'node:path';
import { readBatches } from './batches.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';

const MAX_CONFIG_LINES = 200;
const MAX_CONFIG_BYTES = 100_000;

export async function combineConfigFiles(
  root,
  { inventory, readFileContents, inspectFile, concurrency = 8 } = {},
) {
  const portableInventory = inventory.map((relativePath) => relativePath.replaceAll('\\', '/'));
  for (const relativePath of portableInventory)
    if (isAbsolutePortablePath(relativePath))
      throw new Error(`Configuration path escapes review root: ${relativePath}`);
  const configFiles = portableInventory.filter((relativePath) => {
    const normalized = relativePath.toLowerCase();
    return (
      normalized.startsWith('.github/') || normalized.startsWith('.knit/')
    );
  });
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Configuration concurrency must be a positive integer');
  const sections = await readBatches(configFiles, {
    batchSize: concurrency,
    maxChars: Infinity,
    read: async (relativePath) => {
      const resolvedPath = resolveConfigPath(root, relativePath);
      const inspect = inspectFile ?? lstat;
      const metadata = await inspect(resolvedPath);
      if (metadata.isSymbolicLink())
        throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
      if (!metadata.isFile())
        throw new Error(`configuration path is not a regular file: ${relativePath}`);
      const bounded = readFileContents
        ? await readFileContents(resolvedPath)
        : await readFileUpToLimit(resolvedPath, MAX_CONFIG_BYTES);
      const source = bounded && typeof bounded === 'object' && 'data' in bounded ? bounded.data : bounded;
      const bytes = Buffer.isBuffer(source) ? source : Buffer.from(String(source));
      if (bytes.includes(0)) return '';
      const text = bytes.toString('utf8');
      const lines = text.split(/\r\n|\r|\n/u);
      while (lines.at(-1) === '') lines.pop();
      const truncated = bounded?.truncated === true || lines.length > MAX_CONFIG_LINES;
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

function resolveConfigPath(root, relativePath) {
  const portable = relativePath.replaceAll('\\', '/');
  const normalized = path.posix.normalize(portable);
  if (normalized === '..' || normalized.startsWith('../'))
    throw new Error(`Configuration path escapes review root: ${relativePath}`);
  return path.resolve(root, normalized);
}

function isAbsolutePortablePath(relativePath) {
  return (
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    /^(?:\\\\|\/\/)/u.test(relativePath)
  );
}
