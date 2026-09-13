export async function validateEnvironmentPermissions({
  envFile,
  inspectPermissions,
  platform,
  filePresent = true,
}) {
  if (['linux', 'darwin', 'freebsd'].includes(platform)) {
    try {
      const metadata = await inspectPermissions(envFile);
      if (!Number.isInteger(metadata?.mode))
        throw new Error(`${envFile} permissions could not be verified`);
      if ((metadata.mode & 0o077) !== 0)
        throw new Error(`${envFile} must not be readable by group or other users`);
    } catch (cause) {
      if (cause?.code === 'ENOENT' && !filePresent) return;
      if (cause?.code === 'ENOENT')
        throw new Error(`${envFile} disappeared before permissions could be verified`);
      if (cause?.message?.includes('must not be readable')) throw cause;
      throw new Error(
        `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }
    return;
  }

  if (platform !== 'win32') throw new Error(`Unsupported permission platform: ${platform}`);

  let permissionsMissing = false;
  const metadata = await inspectPermissions(envFile).catch((cause) => {
    if (cause?.code === 'ENOENT') {
      if (filePresent) throw new Error(`${envFile} disappeared before permissions could be verified`);
      permissionsMissing = true;
      return undefined;
    }
    throw new Error(
      `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  });
  const aclWasReported = metadata && Object.hasOwn(metadata, 'aclRestricted');
  if (!permissionsMissing && (!aclWasReported || metadata.aclRestricted !== true))
    throw new Error(`Unable to verify Windows ACL restrictions for ${envFile}`);
}
