import process from 'node:process';
import { loadEnv } from './config.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  readEnvFile = readFile,
  openEnvFile,
  inspectFile,
  environment,
}) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    readFile,
    readEnvFile,
    openEnvFile,
    inspectFile,
  });
  const effectiveEnvironment = { ...process.env, ...environment };
  loadEnv(envText, effectiveEnvironment);
  return effectiveEnvironment;
}
