import process from 'node:process';
import { loadEnv } from './config.mjs';
import { validateEnvironmentPermissions } from './environment-permissions.mjs';
import { readReviewEnvironmentFile } from './environment-file.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  readEnvFile = readFile,
  openEnvFile,
  inspectFile,
  inspectPermissions,
  platform,
  validatePermissions = true,
  environment = { ...process.env },
}) {
  let filePresent = false;
  const envText = await readReviewEnvironmentFile({
    envFile,
    readFile,
    readEnvFile,
    openEnvFile,
    inspectFile,
    onFileRead: () => {
      filePresent = true;
    },
  });
  if (validatePermissions)
    await validateEnvironmentPermissions({ envFile, inspectPermissions, platform, filePresent });
  loadEnv(envText, environment);
  return environment;
}
