function inspectionError(envFile, message, cause) {
  return new Error(`${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, {
    cause,
  });
}

function assertNotSymbolicLink(envFile, metadata) {
  if (typeof metadata?.isSymbolicLink !== 'function')
    throw new Error(`${envFile} inspection did not provide symbolic-link metadata`);
  if (metadata.isSymbolicLink()) throw new Error(`${envFile} must not be a symbolic link`);
}

function fileIdentity(metadata) {
  const { dev, ino } = metadata;
  const valid = (value) => typeof value === 'number' || typeof value === 'bigint';
  return valid(dev) && valid(ino) ? `${dev}:${ino}` : undefined;
}

export async function readReviewEnvironmentFile({ envFile, readEnvFile, inspectFile, onFileRead }) {
  let initiallyMissing = false;
  let initialMetadata;
  try {
    initialMetadata = await inspectFile(envFile);
    assertNotSymbolicLink(envFile, initialMetadata);
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

  if (!initiallyMissing) {
    try {
      const finalMetadata = await inspectFile(envFile);
      assertNotSymbolicLink(envFile, finalMetadata);
      const initialIdentity = fileIdentity(initialMetadata);
      const finalIdentity = fileIdentity(finalMetadata);
      if (initialIdentity && finalIdentity && initialIdentity !== finalIdentity)
        throw new Error(`${envFile} was replaced while it was being read`);
    } catch (cause) {
      throw inspectionError(envFile, 'Unable to verify', cause);
    }
  }
  onFileRead?.();
  return envText;
}
