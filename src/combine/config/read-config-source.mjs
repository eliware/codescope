import { lstat, open } from "node:fs/promises";
import { readVerifiedFile } from "../read-verified-file.mjs";
import { readHandleUpToLimit } from "../read-file-up-to-limit.mjs";
import { resolveConfigPath } from "./paths.mjs";

export const MAX_CONFIG_BYTES = 100_000;

export async function readConfigSource(
  root,
  relativePath,
  { readFileContents, inspectFile, openFile = open, platform = process.platform } = {},
) {
  const filePath = resolveConfigPath(root, relativePath, platform);
  const metadata = await (inspectFile ?? lstat)(filePath, { bigint: true });
  if (metadata.isSymbolicLink())
    throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
  if (!metadata.isFile())
    throw new Error(`configuration path is not a regular file: ${relativePath}`);
  if (readFileContents) return readFileContents(filePath);
  return readVerifiedFile(filePath, metadata, {
    openFile,
    label: "configuration",
    changedWhileReading: "configuration file changed during read",
    readHandle: (handle) => readHandleUpToLimit(handle, MAX_CONFIG_BYTES),
  });
}
