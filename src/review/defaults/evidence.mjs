import { fs } from '@eliware/common';
import { combineMjsFiles } from '../../combine/source-file-aliases.mjs';
import { lstat } from 'node:fs/promises';

export function createEvidenceDefaults() {
  return {
    combine: combineMjsFiles,
    maxSourceChars: 2_000_000,
    inspectFile: lstat,
    readFile: fs.promises.readFile,
  };
}
