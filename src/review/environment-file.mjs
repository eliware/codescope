import { assertNotSymbolicLink, assertRegularFile, fileIdentity } from './environment-file-safety.mjs';

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
    if (cause?.code === 'ENOENT') return '';
    else throw inspectionError(envFile, 'Unable to inspect', cause);
  }
  let initialIdentity;
  try {
    initialIdentity = fileIdentity(envFile, initialMetadata);
  } catch (cause) {
    throw inspectionError(envFile, 'Unable to inspect', cause);
  }

  let handle;
  let reportedError;
  let envText;
  try {
    if (typeof openEnvFile !== 'function')
      throw new Error('a stable environment-file opener is required');
    handle = await openEnvFile(envFile, 'r');
    const openedMetadata = await handle.stat();
    assertNotSymbolicLink(envFile, openedMetadata);
    assertRegularFile(envFile, openedMetadata);
    const openedIdentity = fileIdentity(envFile, openedMetadata);
    if (initialIdentity !== openedIdentity)
      throw new Error(`${envFile} was replaced while it was being opened`);
    envText = await handle.readFile('utf8');
  } catch (cause) {
    reportedError = inspectionError(envFile, 'Unable to securely read', cause);
  }
  let closeError;
  try {
    await handle?.close();
  } catch (cause) {
    closeError = cause;
  }
  if (reportedError) {
    if (closeError) reportedError.closeError = closeError;
    throw reportedError;
  }
  if (closeError) throw inspectionError(envFile, 'Unable to close securely', closeError);
  onFileRead?.();
  return envText;
}
