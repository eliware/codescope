import { findFiles } from '../find/files.mjs';
import { matchesFile } from '../find/extensions.mjs';

export async function selectFiles(root, extension, {
  files,
  readDirectory,
  noTests = false,
  testsOnly = false,
}) {
  return files
    ? files.filter((relativePath) => matchesFile(
      relativePath.split(/[\\/]/u).at(-1), extension, testsOnly, noTests,
    ))
    : findFiles(root, extension, { readDirectory, noTests, testsOnly });
}
