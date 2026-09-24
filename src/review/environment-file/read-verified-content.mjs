import { assertNotSymbolicLink, assertRegularFile } from "../environment-file-safety.mjs";
import { fileIdentity } from "../environment-file-identity.mjs";

export async function readVerifiedEnvironmentContent(envFile, handle, initialIdentity) {
  const before = await handle.stat({ bigint: true });
  assertNotSymbolicLink(envFile, before);
  assertRegularFile(envFile, before);
  if (initialIdentity !== fileIdentity(envFile, before))
    throw new Error(`${envFile} was replaced while it was being opened`);
  const content = await handle.readFile("utf8");
  const after = await handle.stat({ bigint: true });
  assertNotSymbolicLink(envFile, after);
  assertRegularFile(envFile, after);
  if (
    fileIdentity(envFile, before) !== fileIdentity(envFile, after) ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  )
    throw new Error(`${envFile} changed while it was being read`);
  return content;
}
