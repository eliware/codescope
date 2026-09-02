import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);

export async function findFiles(
  root,
  extension,
  { readDirectory = readdir, noTests = false, testsOnly = false } = {},
) {
  if (typeof root !== 'string') throw new Error('Scan root must be a path string');

  if (process.platform !== 'win32' && /^[A-Za-z]:[\\/]/u.test(root))
    throw new Error('Windows-style scan roots require a Windows host');

  const pathApi = path;
  root = pathApi.resolve(root);

  const results = [];
  const pending = [root];
  const rootPath = pathApi.resolve(root);


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
    for (const entry of entries) {
      if (
        typeof entry.name !== 'string' ||
        !entry.name ||
        entry.name === '.' ||
        entry.name === '..' ||
        entry.name.includes('/') ||
        entry.name.includes('\\')
      )
        throw new Error(
          `Invalid directory entry name in ${pathApi.relative(root, directory) || '.'}`,
        );
    }

    entries.sort((left, right) => left.name.localeCompare(right.name));
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
        ![...IGNORED_DIRECTORIES].some(
          (ignored) => ignored.toLowerCase() === normalizedName.toLowerCase(),
        )
      )
        pending.push(childPath);
      else if (
        isFile &&
        normalizedName.endsWith(extension) &&
        (!extension.endsWith('.mjs') ||
          (testsOnly && normalizedName.endsWith('.test.mjs')) ||
          (!testsOnly && !(noTests && normalizedName.endsWith('.test.mjs'))))
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
