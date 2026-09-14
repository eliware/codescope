import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatSourceSection } from './section-format.mjs';

export async function combinePackageJson(root, options = {}) {
  const readFileContents = options.readFileContents ?? readFile;
  const inspectFile = options.inspectFile ?? lstat;
  const packagePath = path.join(root, 'package.json');
  let contents;
  try {
    if (options.validateSymlinks || readFileContents === readFile) {
      const metadata = await inspectFile(packagePath);
      if (metadata.isSymbolicLink()) throw new Error('symlinked package.json is not supported');
      if (!metadata.isFile()) throw new Error('package.json is not a regular file');
    }
    contents = await readFileContents(packagePath, 'utf8');
  } catch (cause) {
    throw new Error(
      `Unable to read package.json: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
  if (typeof contents !== 'string')
    throw new Error('Unable to read package.json: file reader returned non-string content');
  return formatSourceSection('package.json', contents);
}
