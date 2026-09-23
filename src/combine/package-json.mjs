import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatSourceSection } from './section-format.mjs';
import { readSourceFile } from './read-file.mjs';

export async function combinePackageJson(root, options = {}) {
  const readFileContents = options.readFileContents ?? readFile;
  const inspectFile = options.inspectFile ?? lstat;
  const pathApi = options.platform === 'win32' ? path.win32 : path.posix;
  const packagePath = pathApi.join(root, 'package.json');
  try {
    const contents = await readSourceFile('package.json', packagePath, {
      readFileContents,
      inspectFile,
      validateSymlinks: true,
    });
    return formatSourceSection('package.json', contents);
  } catch (cause) {
    if (cause?.message === 'Unable to read package.json: symlinked source files are not supported')
      throw new Error('Unable to read package.json: symlinked package.json is not supported', { cause });
    throw new Error(
      `Unable to read package.json: ${cause.message}`,
      { cause },
    );
  }
}
