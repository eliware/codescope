import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isIgnoredDirectory } from './policies.mjs';
import { matchesFile } from './extensions.mjs';
import { validateScanMode, validateScanRoot, validateScanRootMetadata } from './root-policy.mjs';
import { classifyEntry } from './entry-types.mjs';
import { readDirectoryEntries } from './read-entries.mjs';

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

  const pathApi = path;
  root = pathApi.resolve(root);

  if (readDirectory === readdir || inspectRoot !== lstat) {
    const metadata = await inspectRoot(root);
    validateScanRootMetadata(metadata);
  }

  const results = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    const entries = await readDirectoryEntries(readDirectory, directory, root, pathApi);
    for (const entry of entries) {
      const entryType = classifyEntry(entry, pathApi.relative(root, directory));
      if (entryType.skip) continue;
      const { isDirectory, isFile } = entryType;
      const childPath = pathApi.resolve(directory, entry.name);

      const normalizedName = entry.name;
      if (isDirectory && !isIgnoredDirectory(normalizedName, pathApi.relative(root, directory)))
        pending.push(childPath);
      else if (isFile && matchesFile(normalizedName, extension, testsOnly, noTests)) {
        results.push(
          pathApi.relative(root, pathApi.join(directory, entry.name)).split(/[\\/]/u).join('/'),
        );
      }
    }
  }
  return results.sort();
}

export const findMjsFiles = (root, options) => findFiles(root, '.mjs', options);
export const findMdFiles = (root, options) => findFiles(root, '.md', options);
export const findAllFiles = (root, options) => findFiles(root, '', options);
