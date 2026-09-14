import process from 'node:process';
import { loadEnv } from './config.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  readEnvFile = readFile,
  openEnvFile,
  inspectFile,
  environment = { ...process.env },
}) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    readFile,
    readEnvFile,
    openEnvFile,
    inspectFile,
  });
  loadEnv(envText, environment);
  return environment;
}
