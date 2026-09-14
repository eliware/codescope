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
  const effectiveEnvironment = resolveTokenEnvironment(environment);
  loadEnv(envText, effectiveEnvironment);
  return effectiveEnvironment;
}

function resolveTokenEnvironment(environment) {
  const processToken = process.env.OPENAI_API_TOKEN;
  const injectedToken = environment?.OPENAI_API_TOKEN;
  if (processToken?.trim()) return { OPENAI_API_TOKEN: processToken };
  if (injectedToken?.trim()) return { OPENAI_API_TOKEN: injectedToken };
  return {};
}
