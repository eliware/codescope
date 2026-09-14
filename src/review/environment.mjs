import process from 'node:process';
import { loadEnv } from './config.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  openEnvFile,
  inspectFile,
  environment,
}) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    readFile,
    openEnvFile,
    inspectFile,
  });
  const effectiveEnvironment = {};
  const processToken = process.env.OPENAI_API_TOKEN;
  const injectedToken = environment?.OPENAI_API_TOKEN;
  if (processToken?.trim()) effectiveEnvironment.OPENAI_API_TOKEN = processToken;
  else if (injectedToken?.trim()) effectiveEnvironment.OPENAI_API_TOKEN = injectedToken;
  else if (processToken !== undefined) effectiveEnvironment.OPENAI_API_TOKEN = processToken;
  else if (injectedToken !== undefined) effectiveEnvironment.OPENAI_API_TOKEN = injectedToken;
  loadEnv(envText, effectiveEnvironment);
  return effectiveEnvironment;
}
