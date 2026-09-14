import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { formatSourceSection } from './section-format.mjs';
import { readSourceFile } from './read-file.mjs';
import { assertWithinLimit, getBatchSize } from './limits.mjs';
import { readBatches } from './batches.mjs';

export async function combineJsonFiles(
  root,
  {
    readDirectory,
    readFileContents = readFile,
    inspectFile,
    validateSymlinks = false,
    concurrency = 16,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  const files = (await findFiles(root, '.json', { readDirectory })).filter(isIncludedJson);
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  const sections = await readBatches(files, {
    batchSize: getBatchSize(concurrency),
    maxChars,
    read: async (relativePath) => {
      const resolvedPath = resolveJsonPath(rootPath, relativePath, pathApi);
      const contents = await readSourceFile(relativePath, resolvedPath, {
        readFileContents,
        inspectFile,
        validateSymlinks,
      });
      if (Number.isFinite(maxChars)) assertWithinLimit(contents.length, maxChars);
      return formatSourceSection(relativePath, contents);
    },
  });
  return sections.join('\n');
}

export function resolveJsonPath(rootPath, relativePath, pathApi = path) {
  const portablePath = String(relativePath).replaceAll('\\', '/');
  if (
    path.posix.isAbsolute(portablePath) ||
    path.win32.isAbsolute(portablePath) ||
    /^(?:\\\\|\/\/)/u.test(portablePath)
  )
    throw new Error(`JSON path escapes review root: ${relativePath}`);
  const normalizedPath = pathApi.normalize(portablePath).replaceAll('\\', '/');
  if (normalizedPath === '..' || normalizedPath.startsWith('../'))
    throw new Error(`JSON path escapes review root: ${relativePath}`);
  return pathApi.resolve(rootPath, ...normalizedPath.split('/'));
}

function isIncludedJson(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const lower = normalized.toLowerCase();
  if (!lower.endsWith('.json') || lower === 'package.json' || lower === 'package-lock.json')
    return false;
  if (!normalized.includes('/')) return true;
  return ['docs/', 'specs/'].some((directory) => lower.startsWith(directory));
}
