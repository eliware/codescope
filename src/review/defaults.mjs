import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from '../combine/files.mjs';
import { prompt as defaultPrompt } from '../prompt.mjs';
import { defaultEnvFile } from './config.mjs';
import { lstat, open } from 'node:fs/promises';

export function createReviewDefaults({ platform = process.platform } = {}) {
  return {
    write: (value) => {
      process.stdout.write(value);
      return { written: value.length };
    },
    readFile: fs.promises.readFile,
    openEnvFile: open,
    envFile: defaultEnvFile(),
    environment: process.env,
    prompt: defaultPrompt,
    combine: combineMjsFiles,
    maxSourceChars: 2_000_000,
    usage: false,
    dryRun: false,
    model: undefined,
    createClient: createOpenAI,
    register: registerSignals,
    inspectFile: lstat,
    platform,
  };
}
