import { lstat } from 'node:fs/promises';
import path from 'node:path';
import { readBatches } from './batches.mjs';
import { readFileUpToLimit } from './read-file-up-to-limit.mjs';
import { validateScanRoot } from '../find/root-policy.mjs';

const MAX_CONFIG_LINES = 200;
const MAX_CONFIG_BYTES = 100_000;

export async function combineConfigFiles(
  root,
  { inventory, readFileContents, inspectFile, concurrency = 8, platform = process.platform } = {},
) {
  validateScanRoot(root, platform);
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
      const resolvedPath = resolveConfigPath(root, relativePath, platform);
      const inspect = inspectFile ?? lstat;
      const metadata = await inspect(resolvedPath);
      if (metadata.isSymbolicLink())
        throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
      if (!metadata.isFile())
        throw new Error(`configuration path is not a regular file: ${relativePath}`);
      const bounded = readFileContents
        ? await readFileContents(resolvedPath)
        : await readFileUpToLimit(resolvedPath, MAX_CONFIG_BYTES);
      if (
        bounded &&
        typeof bounded === 'object' &&
        !Buffer.isBuffer(bounded) &&
        (!Object.hasOwn(bounded, 'data') || typeof bounded.truncated !== 'boolean')
      )
        throw new Error('Configuration reader must return text, bytes, or { data, truncated }');
      const source = bounded && typeof bounded === 'object' && 'data' in bounded ? bounded.data : bounded;
      if (typeof source !== 'string' && !Buffer.isBuffer(source))
        throw new Error('Configuration reader data must be text or bytes');
      const bytes = Buffer.isBuffer(source) ? source : Buffer.from(String(source));
      if (bytes.byteLength > MAX_CONFIG_BYTES + 1)
        throw new Error(`Configuration reader exceeded the ${MAX_CONFIG_BYTES + 1}-byte sample boundary`);
      if (bytes.includes(0)) return '';
      const exceeded = bytes.byteLength > MAX_CONFIG_BYTES;
      const text = bytes.subarray(0, MAX_CONFIG_BYTES).toString('utf8');
      const lines = text.split(/\r\n|\r|\n/u);
      while (lines.at(-1) === '') lines.pop();
      const byteTruncated = exceeded || bounded?.truncated === true;
      const lineTruncated = lines.length > MAX_CONFIG_LINES;
      const truncated = byteTruncated || lineTruncated;
      const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
      const width = String(visibleLines.length).length;
      const body = visibleLines.map(
        (line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`,
      );
      if (truncated)
        body.push(byteTruncated && !lineTruncated
          ? '[truncated after the per-file byte limit; remaining config omitted]'
          : `[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`);
      return `===== ${relativePath} =====\n${body.join('\n')}\n`;
    },
  });
  const included = sections.filter(Boolean);
  return included.length ? `===== repository configuration =====\n${included.join('\n')}` : '';
}

function resolveConfigPath(root, relativePath, platform) {
  const portable = relativePath.replaceAll('\\', '/');
  const normalized = path.posix.normalize(portable);
  if (normalized === '..' || normalized.startsWith('../'))
    throw new Error(`Configuration path escapes review root: ${relativePath}`);
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  return pathApi.resolve(root, ...normalized.split('/'));
}

function isAbsolutePortablePath(relativePath) {
  return (
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    /^(?:\\\\|\/\/)/u.test(relativePath)
  );
}
