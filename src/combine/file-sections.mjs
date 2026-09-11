import path from 'node:path';
import { formatSourceSection } from './section-format.mjs';
import { readSourceFile } from './read-file.mjs';
import { assertWithinLimit } from './limits.mjs';
import { readBatches } from './batches.mjs';

export async function combineFileSections(root, files, options) {
  const { maxChars, readFileContents, inspectFile, validateSymlinks } = options;
  const rootPath = path.resolve(root);
  const sections = await readBatches(files, {
    batchSize: options.batchSize,
    maxChars,
    read: async (relativePath) => {
      const resolvedPath = path.resolve(rootPath, relativePath);
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
