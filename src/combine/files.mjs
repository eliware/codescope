import { lstat, readFile } from 'node:fs/promises';
import { validateCombineOptions } from './policies.mjs';
import { getBatchSize } from './limits.mjs';
import { combineFileSections } from './file-sections.mjs';
import { selectFiles } from './select-files.mjs';

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
    files,
  } = {},
) {
  validateCombineOptions(root, { concurrency, maxChars, platform });

  const selectedFiles = await selectFiles(root, extension, {
    files, readDirectory, noTests, testsOnly,
  });

  // Windows-style roots are rejected above on non-Windows hosts; on supported
  // hosts the native path implementation is the only valid one.
  const batchSize = getBatchSize(concurrency);
  return combineFileSections(root, selectedFiles, {
    maxChars,
    concurrency,
    batchSize,
    readFileContents,
    inspectFile,
    validateSymlinks,
  });
}

