import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from '../combine/source-file-aliases.mjs';
import { prompt as defaultPrompt } from '../prompt.mjs';
import { defaultEnvFile } from './env-file-path.mjs';
import { lstat, open } from 'node:fs/promises';
import { createDefaultWriter } from '../cli/default-writer.mjs';

export function createReviewDefaults({ platform = process.platform } = {}) {
  return {
    write: createDefaultWriter(),
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
