import { assertNotSymbolicLink, fileIdentity } from '../environment-file-safety.mjs';

export async function inspectEnvironmentFile(envFile, inspectFile) {
  try {
    const metadata = await inspectFile(envFile);
    assertNotSymbolicLink(envFile, metadata);
    return fileIdentity(envFile, metadata);
  } catch (cause) {
    if (cause?.code === 'ENOENT') return null;
    throw createInspectionError(envFile, cause);
  }
}

export function createInspectionError(envFile, cause, message = 'Unable to inspect') {
  return new Error(`${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
}
