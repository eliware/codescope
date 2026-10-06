import { assertNotSymbolicLink, assertRegularFile } from "../environment-file-safety.mjs";

export async function inspectEnvironmentFile(envFile, inspectFile, envFileExplicit = false) {
  try {
    const metadata = await inspectFile(envFile);
    assertNotSymbolicLink(envFile, metadata);
    assertRegularFile(envFile, metadata);
    return true;
  } catch (cause) {
    if (cause?.code === "ENOENT" && !envFileExplicit) return null;
    throw createInspectionError(envFile, cause);
  }
}

export function createInspectionError(envFile, cause, message = "Unable to inspect") {
  return new Error(
    `${message} ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
    { cause },
  );
}
