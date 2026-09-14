import { assertNotSymbolicLink, assertRegularFile, fileIdentity } from './environment-file-safety.mjs';

function readError(envFile, message, cause) {
  return new Error(`${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, {
    cause,
  });
}

export async function readStableEnvironmentFile({ envFile, openEnvFile, initialIdentity }) {
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
    reportedError = readError(envFile, 'Unable to securely read', cause);
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
  if (closeError) throw readError(envFile, 'Unable to close securely', closeError);
  return envText;
}
