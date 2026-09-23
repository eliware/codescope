import { readFile } from 'node:fs/promises';
import { readBatches } from '../batches.mjs';
import { readSourceFile } from '../read-file.mjs';
import { formatSourceSection } from '../section-format.mjs';
import { normalizeConventionPath, resolveConventionPath } from './paths.mjs';

export function readConventionRecords(
  specsRoot,
  files,
  {
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    readFileContents = readFile,
    inspectFile,
    platform = process.platform,
  } = {},
) {
  return readBatches(files, {
    batchSize: concurrency,
    maxChars,
    read: async (relativePath) => {
      const portablePath = resolveConventionPath(specsRoot, relativePath, platform);
      const contents = await readSourceFile(
        'conventions/specs/' + relativePath,
        portablePath,
        { readFileContents, inspectFile, validateSymlinks: true },
      );
      const normalizedPath = normalizeConventionPath(relativePath);
      return formatSourceSection('conventions/specs/' + normalizedPath, contents);
    },
  });
}
