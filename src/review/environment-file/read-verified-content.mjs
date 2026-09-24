import { assertNotSymbolicLink, assertRegularFile } from "../environment-file-safety.mjs";
import { fileIdentity } from "../environment-file-identity.mjs";

export async function readVerifiedEnvironmentContent(envFile, handle, initialIdentity) {
  const metadata = await handle.stat();
  assertNotSymbolicLink(envFile, metadata);
  assertRegularFile(envFile, metadata);
  if (initialIdentity !== fileIdentity(envFile, metadata))
    throw new Error(`${envFile} was replaced while it was being opened`);
  return handle.readFile("utf8");
}
