import path from 'node:path';
import { assertNotSymbolicLink, fileIdentity } from './environment-file-safety.mjs';
import { readStableEnvironmentFile } from './stable-environment-reader.mjs';

function inspectionError(envFile, message, cause) {
  return new Error(`${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, {
    cause,
  });
}

export async function readReviewEnvironmentFile({
  envFile,
  openEnvFile,
  inspectFile,
  onFileRead,
}) {
  let initialMetadata;
  try {
    initialMetadata = await inspectFile(envFile);
    assertNotSymbolicLink(envFile, initialMetadata);
  } catch (cause) {
    if (cause?.code === 'ENOENT') {
      try {
        if (await isAbsentEnvironmentFile(envFile, inspectFile)) return '';
      } catch (parentCause) {
        throw inspectionError(envFile, 'Unable to inspect', parentCause);
      }
      throw inspectionError(envFile, 'Unable to inspect', cause);
    }
    else throw inspectionError(envFile, 'Unable to inspect', cause);
  }
  let initialIdentity;
  try {
    initialIdentity = fileIdentity(envFile, initialMetadata);
  } catch (cause) {
    throw inspectionError(envFile, 'Unable to inspect', cause);
  }
  const envText = await readStableEnvironmentFile({ envFile, openEnvFile, initialIdentity });
  onFileRead?.();
  return envText;
}

async function isAbsentEnvironmentFile(envFile, inspectFile) {
  try {
    const parent = await inspectFile(path.dirname(envFile));
    return typeof parent.isDirectory === 'function' && parent.isDirectory();
  } catch (cause) {
    if (cause?.code === 'ENOENT') return true;
    throw cause;
  }
}
