import process from 'node:process';
import { loadEnv } from './config.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  openEnvFile,
  inspectFile,
  environment = process.env,
}) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    openEnvFile,
    inspectFile,
  });
  const fileEnvironment = {};
  loadEnv(envText, fileEnvironment);
  return resolveTokenEnvironment(fileEnvironment, environment);
}

function resolveTokenEnvironment(fileEnvironment, environment) {
  const processToken = environment.OPENAI_API_TOKEN;
  const fileToken = fileEnvironment.OPENAI_API_TOKEN;
  if (processToken?.trim()) return { OPENAI_API_TOKEN: processToken };
  if (fileToken?.trim()) return { OPENAI_API_TOKEN: fileToken };
  return {};
}
