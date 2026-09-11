import { defaultEnvFile, loadEnv } from './config.mjs';
import { validateEnvironmentPermissions } from './environment-permissions.mjs';

export async function loadReviewEnvironment({
  envFile,
  readFile,
  readEnvFile,
  inspectFile,
  inspectPermissions,
  platform,
  environment = { ...process.env },
}) {
  let envText = '';
  if (readEnvFile === readFile && envFile === defaultEnvFile()) {
    try {
      const metadata = await inspectFile(envFile);
      if (metadata.isSymbolicLink()) throw new Error('~/.codescope must not be a symbolic link');
    } catch (cause) {
      if (cause?.code !== 'ENOENT')
        throw new Error(
          `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
    }
  }
  try {
    envText = await readEnvFile(envFile, 'utf8');
  } catch (cause) {
    if (cause?.code !== 'ENOENT')
      throw new Error(
        `Unable to read ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
  }
  if (readEnvFile === readFile && envFile === defaultEnvFile())
    await validateEnvironmentPermissions({ envFile, inspectPermissions, platform });
  loadEnv(envText, environment);
  return environment;
}
