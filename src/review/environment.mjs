import process from 'node:process';
import { defaultEnvFile, loadEnv } from './config.mjs';
import { validateEnvironmentPermissions } from './environment-permissions.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  readEnvFile,
  inspectFile,
  inspectPermissions,
  platform,
  environment = { ...process.env },
}) {
  const envText = await readReviewEnvironmentFile({ envFile, readFile, readEnvFile, inspectFile });
  if (readEnvFile === readFile && envFile === defaultEnvFile())
    await validateEnvironmentPermissions({ envFile, inspectPermissions, platform });
  loadEnv(envText, environment);
  return environment;
}
