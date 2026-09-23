import path from 'node:path';
import { findFiles } from '../../find/files.mjs';

export async function discoverConventionFiles(
  conventionsRoot,
  { readDirectory, platform = process.platform } = {},
) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const specsRoot = pathApi.join(conventionsRoot, 'specs');
  try {
    return {
      specsRoot,
      files: await findFiles(specsRoot, '.json', { readDirectory, platform }),
    };
  } catch (cause) {
    if (cause?.code === 'ENOENT' || cause?.code === 'ENOTDIR') return undefined;
    throw new Error(`Unable to discover convention evidence: ${String(cause)}`, { cause });
  }
}
