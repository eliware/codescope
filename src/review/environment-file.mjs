import { defaultEnvFile } from './env-file-path.mjs';

function inspectionError(envFile, message, cause) {
  return new Error(`${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, {
    cause,
  });
}

function assertNotSymbolicLink(envFile, metadata) {
  if (metadata.isSymbolicLink()) throw new Error('~/.codescope must not be a symbolic link');
}

export async function readReviewEnvironmentFile({ envFile, readEnvFile, inspectFile }) {
  if (envFile !== defaultEnvFile()) {
    try {
      return await readEnvFile(envFile, 'utf8');
    } catch (cause) {
      if (cause?.code === 'ENOENT') return '';
      throw inspectionError(envFile, 'Unable to read', cause);
    }
  }

  let initiallyMissing = false;
  try {
    assertNotSymbolicLink(envFile, await inspectFile(envFile));
  } catch (cause) {
    if (cause?.code === 'ENOENT') initiallyMissing = true;
    else throw inspectionError(envFile, 'Unable to inspect', cause);
  }

  let envText;
  try {
    envText = await readEnvFile(envFile, 'utf8');
  } catch (cause) {
    if (cause?.code === 'ENOENT' && initiallyMissing) return '';
    throw inspectionError(envFile, 'Unable to read', cause);
  }

  if (initiallyMissing) {
    try {
      assertNotSymbolicLink(envFile, await inspectFile(envFile));
    } catch (cause) {
      throw inspectionError(envFile, 'Unable to verify after it appeared', cause);
    }
  }
  return envText;
}
