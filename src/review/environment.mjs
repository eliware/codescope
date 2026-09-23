import process from 'node:process';
import { loadEnvironmentFile } from './environment/load-environment-file.mjs';
import { resolveTokenEnvironment } from './environment/resolve-token-environment.mjs';

export async function loadReviewEnvironment({
  envFile,
  openEnvFile,
  inspectFile,
  environment = process.env,
}) {
  const fileEnvironment = await loadEnvironmentFile({
    envFile,
    openEnvFile,
    inspectFile,
  });
  return resolveTokenEnvironment(fileEnvironment, environment);
}
export { resolveTokenEnvironment } from './environment/resolve-token-environment.mjs';
