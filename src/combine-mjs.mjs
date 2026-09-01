import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findMjsFiles } from './find-mjs.mjs';

export async function combineMjsFiles(root, { readDirectory, readFileContents = readFile } = {}) {
  const files = await findMjsFiles(root, { readDirectory });
  const sections = [];
  for (const relativePath of files) {
    const contents = await readFileContents(path.join(root, relativePath), 'utf8');
    sections.push(`===== ${relativePath} =====\n${contents}`);
  }
  return sections.join('\n\n');
}
