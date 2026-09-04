import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { isIgnoredDirectory } from './policies.mjs';
import { matchesFile } from './extensions.mjs';
import { validateEntryNames } from './entries.mjs';
import { validateScanMode, validateScanRoot, validateScanRootMetadata } from './root-policy.mjs';

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

  // codescope ignore: injected directory adapters intentionally own root validation; native scans validate the root with lstat.
  if (readDirectory === readdir || inspectRoot !== lstat) {
    const metadata = await inspectRoot(root);
    validateScanRootMetadata(metadata);
  }

  const results = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    let entries;
    try {
      entries = await readDirectory(directory, { withFileTypes: true });
    } catch (cause) {
      throw new Error(
        `Unable to scan ${pathApi.relative(root, directory) || '.'}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }
    if (!Array.isArray(entries))
      throw new Error(
        `Unable to scan ${pathApi.relative(root, directory) || '.'}: directory reader returned a non-array`,
      );
    validateEntryNames(entries, pathApi.relative(root, directory));

    entries.sort(
      (left, right) => Number(left.name > right.name) - Number(left.name < right.name),
    );
    for (const entry of entries) {
      let isDirectory = false;
      let isFile = false;
      let isSymlink = false;
      try {
        isSymlink = typeof entry.isSymbolicLink === 'function' && entry.isSymbolicLink();
        if (isSymlink) continue;
        isDirectory = typeof entry.isDirectory === 'function' && entry.isDirectory();
        isFile = typeof entry.isFile === 'function' && entry.isFile();
      } catch (cause) {
        throw new Error(
          `Unable to scan ${pathApi.relative(root, directory) || '.'}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
      }
      if (isDirectory && isFile)
        throw new Error(`Invalid directory entry in ${pathApi.relative(root, directory) || '.'}`);

      if (!isDirectory && !isFile)
        throw new Error(`Invalid directory entry in ${pathApi.relative(root, directory) || '.'}`);
      const childPath = pathApi.resolve(directory, entry.name);

      const normalizedName = entry.name;
      if (
        isDirectory &&
        !isIgnoredDirectory(normalizedName, pathApi.relative(root, directory))
      )
        pending.push(childPath);
      else if (
        isFile &&
        matchesFile(normalizedName, extension, testsOnly, noTests)
      ) {
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
