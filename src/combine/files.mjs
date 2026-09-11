import { lstat, readFile } from 'node:fs/promises';
import { findFiles } from '../find/files.mjs';
import { validateCombineOptions } from './policies.mjs';
import { getBatchSize } from './limits.mjs';
import { combineFileSections } from './file-sections.mjs';

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
  const batchSize = getBatchSize(maxChars, concurrency);
  return combineFileSections(root, files, {
    maxChars,
    concurrency,
    batchSize,
    readFileContents,
    inspectFile,
    validateSymlinks,
  });
}

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
export const combineCodeFiles = (root, options) =>
  combineFiles(root, ['.js', '.mjs', '.cjs', '.ts'], options);
