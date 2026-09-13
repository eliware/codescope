import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from '../combine/files.mjs';
import { prompt as defaultPrompt } from '../prompt.mjs';
import { defaultEnvFile } from './config.mjs';
import { lstat, stat } from 'node:fs/promises';

export function createReviewDefaults() {
  return {
    write: process.stdout.write.bind(process.stdout),
    readFile: fs.promises.readFile,
    envFile: defaultEnvFile(),
    prompt: defaultPrompt,
    combine: combineMjsFiles,
    maxSourceChars: 2_000_000,
    usage: false,
    dryRun: false,
    model: undefined,
    createClient: createOpenAI,
    register: registerSignals,
    inspectFile: lstat,
    inspectPermissions: stat,
    platform: process.platform,
  };
}
