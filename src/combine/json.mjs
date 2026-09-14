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
  } = {},
) {
  const files = (await findFiles(root, '.json', { readDirectory })).filter(isIncludedJson);
  const rootPath = path.resolve(root);
  const sections = await readBatches(files, {
    batchSize: getBatchSize(concurrency),
    maxChars,
    read: async (relativePath) => {
      const contents = await readSourceFile(relativePath, path.resolve(rootPath, relativePath), {
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

function isIncludedJson(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const lower = normalized.toLowerCase();
  if (!lower.endsWith('.json') || lower === 'package.json' || lower === 'package-lock.json')
    return false;
  if (!normalized.includes('/')) return true;
  return ['docs/', 'specs/'].some((directory) => lower.startsWith(directory));
}
