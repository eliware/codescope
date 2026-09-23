import { fs } from '@eliware/common';
import { defaultEnvFile } from '../env-file-path.mjs';
import { open } from 'node:fs/promises';

export function createEnvironmentDefaults() {
  return {
    readFile: fs.promises.readFile,
    openEnvFile: open,
    envFile: defaultEnvFile(),
    environment: process.env,
  };
}
