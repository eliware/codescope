import { stat } from 'node:fs/promises';

export async function validateEnvironmentPermissions({
  envFile,
  inspectPermissions,
  platform,
  defaultInspector = stat,
}) {
  if (platform !== 'win32') {
    try {
      const metadata = await inspectPermissions(envFile);
      if ((metadata.mode & 0o077) !== 0)
        throw new Error('~/.codescope must not be readable by group or other users');
    } catch (cause) {
      if (cause?.code === 'ENOENT') return;
      if (cause?.message?.includes('must not be readable')) throw cause;
      throw new Error(
        `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }
    return;
  }

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
  const aclWasReported = metadata && Object.hasOwn(metadata, 'aclRestricted');
  if (
    !permissionsMissing &&
    inspectPermissions !== defaultInspector &&
    (!aclWasReported || metadata.aclRestricted !== true)
  )
    throw new Error('~/.codescope must not be readable by other users');
}
