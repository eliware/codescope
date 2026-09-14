import process from 'node:process';
import { loadEnv } from './config.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  openEnvFile,
  inspectFile,
  environment,
}) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    openEnvFile,
    inspectFile,
  });
  const fileEnvironment = {};
  loadEnv(envText, fileEnvironment);
  return resolveTokenEnvironment(environment, fileEnvironment);
}

function resolveTokenEnvironment(environment, fileEnvironment) {
  const processToken = process.env.OPENAI_API_TOKEN;
  const injectedToken = environment?.OPENAI_API_TOKEN;
  const fileToken = fileEnvironment.OPENAI_API_TOKEN;
  if (processToken?.trim()) return { OPENAI_API_TOKEN: processToken };
  if (injectedToken?.trim()) return { OPENAI_API_TOKEN: injectedToken };
  if (fileToken?.trim()) return { OPENAI_API_TOKEN: fileToken };
  return {};
}
