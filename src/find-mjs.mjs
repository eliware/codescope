import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);

export async function findMjsFiles(root, { readDirectory = readdir } = {}) {
  const results = [];

  async function visit(directory) {
    const entries = await readDirectory(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) await visit(path.join(directory, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.mjs')) {
        results.push(path.relative(root, path.join(directory, entry.name)).split(path.sep).join('/'));
      }
    }
  }

  await visit(root);
  return results.sort();
}
