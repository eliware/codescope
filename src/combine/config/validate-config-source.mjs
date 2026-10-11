import { lstat } from "node:fs/promises";
import { resolveConfigPath } from "./paths.mjs";

export async function validateConfigSource(
  root,
  relativePath,
  { inspectFile = lstat, platform = process.platform } = {},
) {
  const filePath = resolveConfigPath(root, relativePath, platform);
  const metadata = await inspectFile(filePath, { bigint: true });
  if (metadata.isSymbolicLink())
    throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
  if (!metadata.isFile())
    throw new Error(`configuration path is not a regular file: ${relativePath}`);
  return filePath;
}
