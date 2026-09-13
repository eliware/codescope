import process from 'node:process';
import { loadEnv } from './config.mjs';
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
  let filePresent = false;
  const envText = await readReviewEnvironmentFile({
    envFile,
    readFile,
    readEnvFile,
    inspectFile,
    onFileRead: () => {
      filePresent = true;
    },
  });
  if (readEnvFile === readFile)
    await validateEnvironmentPermissions({ envFile, inspectPermissions, platform, filePresent });
  loadEnv(envText, environment);
  return environment;
}
