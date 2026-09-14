import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isIgnoredDirectory } from './policies.mjs';
import { matchesFile } from './extensions.mjs';
import { validateScanMode, validateScanRoot, validateScanRootMetadata } from './root-policy.mjs';
import { classifyEntry } from './entry-types.mjs';
import { readDirectoryEntries } from './read-entries.mjs';
import { walkDirectories } from './walk.mjs';

export async function findFiles(
  root,
  extension,
  {
    readDirectory = readdir,
    noTests = false,
    testsOnly = false,
    inspectRoot = lstat,
    platform = process.platform,
  } = {},
) {
  validateScanRoot(root, platform);
  validateScanMode(noTests, testsOnly);

  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  root = pathApi.resolve(root);

  try {
    const metadata = await inspectRoot(root);
    validateScanRootMetadata(metadata);
  } catch (cause) {
    // Injected directory adapters may model virtual roots that do not exist on disk.
    if (readDirectory === readdir || cause?.code !== 'ENOENT') throw cause;
  }

  const results = [];
  await walkDirectories(root, {
    readEntries: (directory, scanRoot) =>
      readDirectoryEntries(readDirectory, directory, scanRoot, pathApi),
    classify: (entry, directory, scanRoot) =>
      classifyEntry(entry, pathApi.relative(scanRoot, directory)),
    shouldDescend: (name, directory, scanRoot) =>
      !isIgnoredDirectory(name, pathApi.relative(scanRoot, directory)),
    resolveChild: (directory, name) => pathApi.resolve(directory, name),
    onFile: (name, directory, scanRoot) => {
      if (matchesFile(name, extension, testsOnly, noTests))
        results.push(
          pathApi.relative(scanRoot, pathApi.join(directory, name)).split(/[\\/]/u).join('/'),
        );
    },
  });
  return results.sort();
}

export const findMjsFiles = (root, options) => findFiles(root, '.mjs', options);
export const findMdFiles = (root, options) => findFiles(root, '.md', options);
export const findAllFiles = (root, options) => findFiles(root, '', options);
