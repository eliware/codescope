import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from './find-mjs.mjs';

export async function combineFiles(
  root,
  extension,
  {
    readDirectory,
    readFileContents = readFile,
    validateSymlinks = false,
    concurrency = 16,
    maxChars = Number.POSITIVE_INFINITY,
    noTests = false,
    testsOnly = false,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('File read concurrency must be a positive integer');

  if (
    typeof maxChars !== 'number' ||
    Number.isNaN(maxChars) ||
    !(maxChars > 0) ||
    (maxChars !== Number.POSITIVE_INFINITY && !Number.isInteger(maxChars))
  )
    throw new Error('maxChars must be a positive integer or Infinity');

  if (process.platform !== 'win32' && /^[A-Za-z]:[\\/]/u.test(root))
    throw new Error('Windows-style source roots require a Windows host');

  const files = await findFiles(root, extension, { readDirectory, noTests, testsOnly });

  // Windows-style roots are rejected above on non-Windows hosts; on supported
  // hosts the native path implementation is the only valid one.
  const pathApi = path;
  const rootPath = pathApi.resolve(root);

  const sections = [];
  let totalChars = 0;

  const batchSize = Number.isFinite(maxChars) ? 1 : concurrency;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = await Promise.all(
      files.slice(start, start + batchSize).map(async (relativePath) => {
        const resolvedPath = pathApi.resolve(rootPath, relativePath);

        let contents;

        try {
          if (readFileContents === readFile || validateSymlinks) {
            const metadata = await lstat(resolvedPath);
            // codescope ignore: this portable read-only scanner accepts the lstat-before-read TOCTOU race, symlink replacement race, and lack of atomic no-follow filesystem reads.
            if (metadata.isSymbolicLink())
              throw new Error('symlinked source files are not supported');
            if (!metadata.isFile()) throw new Error('source path is not a regular file');
          }

          contents = await readFileContents(resolvedPath, 'utf8');
        } catch (cause) {
          throw new Error(
            `Unable to read ${relativePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
            { cause },
          );
        }
        if (typeof contents !== 'string')
          throw new Error(
            `Unable to read ${relativePath}: file reader returned non-string content`,
          );

        if (Number.isFinite(maxChars) && contents.length > maxChars)
          throw new Error(`Combined source exceeds the ${maxChars}-character limit`);

        const trimmed = contents.replace(/(?:\r\n|\r|\n)$/u, '');

        const lines = trimmed === '' ? ['[empty file]'] : trimmed.split(/\r\n|\r|\n/u);
        const width = String(lines.length).length;
        const numbered = lines
          .map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`)
          .join('\n');
        return `===== ${relativePath} =====\n${numbered}\n`;
      }),
    );

    totalChars +=
      batch.reduce((total, section) => total + section.length, 0) +
      (sections.length > 0 ? 1 : 0) +
      Math.max(0, batch.length - 1);
    if (totalChars > maxChars)
      throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
    sections.push(...batch);
  }
  return sections.join('\n');
}

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
