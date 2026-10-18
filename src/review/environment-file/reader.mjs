import { readEnvironmentContent } from "./read-content.mjs";

function readError(envFile, message, cause) {
  return new Error(
    `${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
    { cause },
  );
}

export async function readEnvironmentFile({ envFile, openEnvFile }) {
  let handle;
  let reportedError;
  let envText;
  try {
    if (typeof openEnvFile !== "function")
      throw new Error("an environment-file opener is required");
    handle = await openEnvFile(envFile, "r");
    envText = await readEnvironmentContent(handle);
  } catch (cause) {
    reportedError = readError(envFile, "Cannot read", cause);
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
  if (closeError) throw readError(envFile, "Cannot close", closeError);
  return envText;
}
