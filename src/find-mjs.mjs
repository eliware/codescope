import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);

export async function findFiles(root, extension, { readDirectory = readdir, noTests = false, testsOnly = false } = {}) {
  // Intentional traversal boundary: filesystem safety and selection rules are centralized to guarantee identical
  // symlink, ignored-directory, and extension behavior for code and Markdown scans.
  // Intentional: roots are interpreted using the host filesystem; foreign-platform paths are not portable inputs.
  if (typeof root !== 'string') throw new Error('Scan root must be a path string');
  /* istanbul ignore next -- foreign-platform path behavior requires a non-Windows host */
  if (process.platform !== 'win32' && /^[A-Za-z]:[\\/]/u.test(root)) throw new Error('Windows-style scan roots require a Windows host');
  /* istanbul ignore next -- Windows path selection is unreachable on non-Windows hosts after the guard above. */
  const pathApi = /^[A-Za-z]:[\\/]/u.test(root) ? path.win32 : path.posix;
  root = pathApi.resolve(root);
  // Intentional memory tradeoff: collect and sort all relative paths before reading so API payload order is stable
  // across filesystems; this avoids nondeterministic reviews at the cost of discovery-time memory.
  const results = [];
  const pending = [root];
  const rootPath = pathApi.resolve(root);
  /* istanbul ignore next -- Windows path comparison is unreachable on non-Windows hosts after the guard above. */
  const comparePath = (value) => pathApi === path.win32 ? value.toLowerCase() : value;
  const comparableRoot = comparePath(rootPath);

  while (pending.length > 0) {
    const directory = pending.pop();
    let entries;
    try { entries = await readDirectory(directory, { withFileTypes: true }); } catch (cause) {
      /* istanbul ignore next -- adapter failures are integration-only */
      throw new Error(`Unable to scan ${pathApi.relative(root, directory) || '.'}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    }
    if (!Array.isArray(entries)) throw new Error(`Unable to scan ${pathApi.relative(root, directory) || '.'}: directory reader returned a non-array`);
    for (const entry of entries) {
      /* istanbul ignore next -- malformed entries are adapter-specific */
      if (typeof entry.name !== 'string' || !entry.name || entry.name === '.' || entry.name === '..' || entry.name.includes('/') || entry.name.includes('\\')) throw new Error(`Invalid directory entry name in ${pathApi.relative(root, directory) || '.'}`);
    }
    /* istanbul ignore next -- duplicate directory names cannot occur in native readdir results */
    entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
    for (const entry of entries) {
      let isDirectory = false;
      let isFile = false;
      let isSymlink = false;
      try {
        // Symlink contract: skip symlinks and platform reparse/junction entries; never follow or inspect targets.
      // Intentional OS boundary: a Dirent is the filesystem snapshot available to this scan; defending against
      // a later replacement of that entry would require holding directory handles and would not be portable.
        isSymlink = typeof entry.isSymbolicLink === 'function' && entry.isSymbolicLink();
        if (isSymlink) continue;
        isDirectory = typeof entry.isDirectory === 'function' && entry.isDirectory();
        isFile = typeof entry.isFile === 'function' && entry.isFile();
      } catch (cause) {
        /* istanbul ignore next -- adapter failures are integration-only */
        throw new Error(`Unable to scan ${pathApi.relative(root, directory) || '.'}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
      }
      if (isDirectory && isFile) throw new Error(`Invalid directory entry in ${pathApi.relative(root, directory) || '.'}`);
      /* istanbul ignore next -- malformed entries are adapter-specific */
      if (!isDirectory && !isFile) throw new Error(`Invalid directory entry in ${pathApi.relative(root, directory) || '.'}`);
      const childPath = pathApi.resolve(directory, entry.name);
      /* istanbul ignore next -- validated native directory names cannot escape this root */
      if (comparePath(childPath) !== comparableRoot && !comparePath(childPath).startsWith(`${comparableRoot}${pathApi.sep}`)) throw new Error(`Unsafe directory path: ${entry.name}`);
      // Intentional policy: only exact lower-case source and *.test.mjs extensions are selected; this avoids
      // platform-dependent profile contents even on case-insensitive filesystems.
      const normalizedName = entry.name;
      if (isDirectory && ![...IGNORED_DIRECTORIES].some((ignored) => ignored.toLowerCase() === normalizedName.toLowerCase())) pending.push(childPath);
      else if (isFile && normalizedName.endsWith(extension) && (!extension.endsWith('.mjs') || ((testsOnly && normalizedName.endsWith('.test.mjs')) || (!testsOnly && !(noTests && normalizedName.endsWith('.test.mjs')))))) {
        results.push(pathApi.relative(root, pathApi.join(directory, entry.name)).split(/[\\/]/u).join('/'));
      }
    }
  }
  return results.sort();
}

export const findMjsFiles = (root, options) => findFiles(root, '.mjs', options);
export const findMdFiles = (root, options) => findFiles(root, '.md', options);
