import { fs } from '@eliware/common';
import { combineFiles } from '../../combine/files.mjs';
import { lstat } from 'node:fs/promises';

export function createEvidenceDefaults() {
  return {
    combine: (root, options) => combineFiles(root, '.mjs', options),
    maxSourceChars: 2_000_000,
    inspectFile: lstat,
    readFile: fs.promises.readFile,
  };
}
