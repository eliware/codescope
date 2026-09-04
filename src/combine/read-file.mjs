import { lstat, readFile } from 'node:fs/promises';

export async function readSourceFile(
  relativePath,
  rootPath,
  { readFileContents = readFile, inspectFile = lstat, validateSymlinks = false } = {},
) {
  try {
    if (readFileContents === readFile || validateSymlinks) {
      const metadata = await inspectFile(rootPath);
      if (metadata.isSymbolicLink()) throw new Error('symlinked source files are not supported');
      if (!metadata.isFile()) throw new Error('source path is not a regular file');
    }
    const contents = await readFileContents(rootPath, 'utf8');
    if (typeof contents !== 'string') throw new Error('file reader returned non-string content');
    return contents;
  } catch (cause) {
    throw new Error(
      `Unable to read ${relativePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
