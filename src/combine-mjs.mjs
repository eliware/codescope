import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from './find-mjs.mjs';

export async function combineFiles(root, extension, { readDirectory, readFileContents = readFile, concurrency = 16, maxChars = Number.POSITIVE_INFINITY, noTests = false, testsOnly = false } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('File read concurrency must be a positive integer');
  if (!(maxChars > 0)) throw new Error('maxChars must be a positive number');
  const files = await findFiles(root, extension, { readDirectory, noTests, testsOnly });
  const pathApi = /^[A-Za-z]:[\\/]/u.test(root) ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  const comparePath = (value) => pathApi === path.win32 ? value.toLowerCase() : value;
  const comparableRoot = comparePath(rootPath);
  const sections = [];
  let totalChars = 0;
  // Intentional: bounded batches protect file descriptors and memory on large repositories.
  // Intentional policy: readFileContents returns complete strings; finite limits serialize reads to avoid holding multiple file bodies while enforcing the request-payload limit.
  const batchSize = Number.isFinite(maxChars) ? 1 : concurrency;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = await Promise.all(files.slice(start, start + batchSize).map(async (relativePath) => {
    const resolvedPath = pathApi.resolve(rootPath, relativePath);
    /* istanbul ignore next -- finder guarantees contained relative paths */
    if (comparePath(resolvedPath) !== comparableRoot && !comparePath(resolvedPath).startsWith(`${comparableRoot}${pathApi.sep}`)) throw new Error(`Unsafe source path: ${relativePath}`);
    let contents;
    /* istanbul ignore next -- filesystem failure is covered by integration checks */
    try { contents = await readFileContents(resolvedPath, 'utf8'); } catch (cause) {
      throw new Error(`Unable to read ${relativePath}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    }
    if (typeof contents !== 'string') throw new Error(`Unable to read ${relativePath}: file reader returned non-string content`);
    // Intentional policy: maxChars measures JavaScript string characters, matching the request payload rather than encoded bytes or tokens.
    if (Number.isFinite(maxChars) && contents.length > maxChars) throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
      // Intentional: remove only the terminal separator; preserve intentional blank source lines.
      const trimmed = contents.replace(/(?:\r\n|\r|\n)$/u, '');
      const lines = trimmed === '' ? ['[empty file]'] : trimmed.split(/\r\n|\r|\n/u);
      const width = String(lines.length).length;
      const numbered = lines.map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`).join('\n');
      return `===== ${relativePath} =====\n${numbered}\n`;
    }));
  // Intentional policy: the formatted payload check includes headers, line numbers, separators, and newline normalization.
    totalChars += batch.reduce((total, section) => total + section.length, 0) + (sections.length > 0 ? 1 : 0);
    if (totalChars > maxChars) throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
    sections.push(...batch);
  }
  return sections.join('\n');
}

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
