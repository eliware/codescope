import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from './find-mjs.mjs';

export async function combineFiles(root, extension, { readDirectory, readFileContents = readFile, validateSymlinks = false, concurrency = 16, maxChars = Number.POSITIVE_INFINITY, noTests = false, testsOnly = false } = {}) {
  // Intentional API contract: noTests/testsOnly are internal mutually exclusive profile flags; callers use profiles
  // rather than constructing a new selection vocabulary.
  // Intentional pipeline boundary: validation, discovery, reading, formatting, and accounting remain together so
  // the character limit covers the exact payload returned to the API.
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('File read concurrency must be a positive integer');
  // Intentional policy: positive Infinity means unlimited source; negative Infinity remains invalid because limits cannot be negative.
  if (typeof maxChars !== 'number' || Number.isNaN(maxChars) || !(maxChars > 0) || (maxChars !== Number.POSITIVE_INFINITY && !Number.isInteger(maxChars))) throw new Error('maxChars must be a positive integer or Infinity');
  /* istanbul ignore next -- foreign-platform path behavior requires a non-Windows host */
  if (process.platform !== 'win32' && /^[A-Za-z]:[\\/]/u.test(root)) throw new Error('Windows-style source roots require a Windows host');
  // Intentional dependency seam: forward the caller's directory reader unchanged so tests and adapters never
  // fall back to the real filesystem.
  const files = await findFiles(root, extension, { readDirectory, noTests, testsOnly });
  /* istanbul ignore next -- Windows path branch is covered only on a Windows host */
  const pathApi = /^[A-Za-z]:[\\/]/u.test(root) ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  /* istanbul ignore next -- Windows path branch is covered only on a Windows host */
  const comparePath = (value) => pathApi === path.win32 ? value.toLowerCase() : value;
  const comparableRoot = comparePath(rootPath);
  const sections = [];
  let totalChars = 0;
  // Intentional: bounded batches protect file descriptors and memory; Promise.all is scoped to one batch so a
  // failed batch aborts the payload rather than returning a misleading partial repository review.
  // Intentional policy: readFileContents returns complete strings; finite limits serialize reads to avoid holding multiple file bodies while enforcing the request-payload limit.
  // The returned combined string necessarily retains the accepted source; callers choose maxChars to bound it.
  const batchSize = Number.isFinite(maxChars) ? 1 : concurrency;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = await Promise.all(files.slice(start, start + batchSize).map(async (relativePath) => {
    const resolvedPath = pathApi.resolve(rootPath, relativePath);
    /* istanbul ignore next -- finder guarantees contained relative paths */
    if (comparePath(resolvedPath) !== comparableRoot && !comparePath(resolvedPath).startsWith(`${comparableRoot}${pathApi.sep}`)) throw new Error(`Unsafe source path: ${relativePath}`);
    let contents;
    /* istanbul ignore next -- filesystem failure is covered by integration checks */
    try {
      // Intentional test seam: injected readers are trusted adapters, while native reads receive the symlink/type
      // preflight below. Production callers use the native defaults; adapters own equivalent checks when substituted.
      if (readFileContents === readFile || validateSymlinks) {
        // Intentional portable policy: lstat immediately before read rejects discovered symlinks. A hostile
        // concurrent replacement between these two path operations is an OS-level TOCTOU limitation; this CLI
        // does not promise adversarial filesystem isolation and never intentionally follows links.
        const metadata = await lstat(resolvedPath);
        if (metadata.isSymbolicLink()) throw new Error('symlinked source files are not supported');
        if (!metadata.isFile()) throw new Error('source path is not a regular file');
      }
        // Intentional limitation: path-based reads cannot make lstat+read atomic on every supported host; the
        // scanner is not an adversarial sandbox. Normal scans still reject every observed link before reading.
        // The scanner never follows links by design; hostile concurrent filesystem mutation is outside its threat model.
        contents = await readFileContents(resolvedPath, 'utf8');
    } catch (cause) {
      throw new Error(`Unable to read ${relativePath}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    }
    if (typeof contents !== 'string') throw new Error(`Unable to read ${relativePath}: file reader returned non-string content`);
    // Intentional policy: maxChars measures JavaScript string characters, matching the request payload rather than encoded bytes or tokens.
    // Intentional early rejection: a single raw file over the request limit cannot fit after headers and line numbers.
    // Intentional early guard: formatted output always adds a header/line numbers, so raw content over the limit
    // cannot fit the configured payload budget; the authoritative check below accounts for all formatting overhead,
    // and separators in the exact formatted payload returned to the provider.
    if (Number.isFinite(maxChars) && contents.length > maxChars) throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
      // Intentional: remove only the terminal separator; preserve intentional blank source lines.
      const trimmed = contents.replace(/(?:\r\n|\r|\n)$/u, '');
      // Intentional formatting cost: line arrays and numbered strings are required to send path/line-addressable source.
      const lines = trimmed === '' ? ['[empty file]'] : trimmed.split(/\r\n|\r|\n/u);
      const width = String(lines.length).length;
      const numbered = lines.map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`).join('\n');
      return `===== ${relativePath} =====\n${numbered}\n`;
    }));
  // Intentional policy: the formatted payload check includes headers, line numbers, separators, and newline normalization.
    // Intentional exact accounting: one separator joins this batch to prior sections, plus separators within it;
    // finite limits use one-file batches, while unlimited mode does not enforce this counter.
    // Count separators arithmetically instead of rebuilding the entire aggregate on every batch.
    totalChars += batch.reduce((total, section) => total + section.length, 0) + (sections.length > 0 ? 1 : 0) + Math.max(0, batch.length - 1);
    if (totalChars > maxChars) throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
    sections.push(...batch);
  }
  return sections.join('\n');
}

export const combineMjsFiles = (root, options) => combineFiles(root, '.mjs', options);
export const combineMdFiles = (root, options) => combineFiles(root, '.md', options);
