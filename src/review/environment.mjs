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
  const effectiveEnvironment = { ...environment };
  for (const [name, value] of Object.entries(process.env)) {
    if (name !== 'OPENAI_API_TOKEN' || value?.trim() || effectiveEnvironment[name] === undefined)
      effectiveEnvironment[name] = value;
  }
  loadEnv(envText, effectiveEnvironment);
  return effectiveEnvironment;
}
