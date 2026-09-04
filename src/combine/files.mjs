import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { formatSourceSection } from './section-format.mjs';
import { validateCombineOptions } from './policies.mjs';
import { readSourceFile } from './read-file.mjs';
import { addBatchLength, assertWithinLimit, getBatchSize } from './limits.mjs';

export async function combineFiles(
  root,
  extension,
  {
    readDirectory,
    readFileContents = readFile,
    inspectFile = lstat,
    validateSymlinks = false,
    concurrency = 16,
    maxChars = Number.POSITIVE_INFINITY,
    noTests = false,
    testsOnly = false,
    platform = process.platform,
  } = {},
) {
  validateCombineOptions(root, { concurrency, maxChars, platform });

  const files = await findFiles(root, extension, { readDirectory, noTests, testsOnly });

  // Windows-style roots are rejected above on non-Windows hosts; on supported
  // hosts the native path implementation is the only valid one.
  const pathApi = path;
  const rootPath = pathApi.resolve(root);

  const sections = [];
  let totalChars = 0;

  // codescope ignore: finite-limit scans intentionally serialize reads to keep aggregate character accounting deterministic.
  const batchSize = getBatchSize(maxChars, concurrency);
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = await Promise.all(
      files.slice(start, start + batchSize).map(async (relativePath) => {
        const resolvedPath = pathApi.resolve(rootPath, relativePath);

        const contents = await readSourceFile(relativePath, resolvedPath, {
          readFileContents,
          inspectFile,
          validateSymlinks,
        });

        if (Number.isFinite(maxChars)) assertWithinLimit(contents.length, maxChars);

        return formatSourceSection(relativePath, contents);
      }),
    );

    totalChars = addBatchLength(
      totalChars,
      batch.reduce((total, section) => total + section.length, 0),
      batch.length,
    );
    assertWithinLimit(totalChars, maxChars);
    sections.push(...batch);
  }
  return sections.join('\n');
}

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
export const combineCodeFiles = (root, options) =>
  combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], options);
