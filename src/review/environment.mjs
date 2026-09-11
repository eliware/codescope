import { defaultEnvFile, loadEnv } from './config.mjs';

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
  if (readEnvFile === readFile && envFile === defaultEnvFile() && platform !== 'win32') {
    try {
      const metadata = await inspectPermissions(envFile);
      if ((metadata.mode & 0o077) !== 0)
        throw new Error('~/.codescope must not be readable by group or other users');
    } catch (cause) {
      if (cause?.code === 'ENOENT') {
      } else if (cause?.message?.includes('must not be readable')) throw cause;
      else
        throw new Error(
          `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
    }
  }
  if (readEnvFile === readFile && envFile === defaultEnvFile() && platform === 'win32') {
    let permissionsMissing = false;
    const metadata = await inspectPermissions(envFile).catch((cause) => {
      if (cause?.code === 'ENOENT') {
        permissionsMissing = true;
        return undefined;
      }
      throw new Error(
        `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    });
    if (!permissionsMissing && (!metadata || metadata.aclRestricted !== true))
      throw new Error('~/.codescope must not be readable by other users');
  }
  loadEnv(envText, environment);
  return environment;
}
