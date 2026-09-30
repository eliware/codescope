import { lstat, open } from "node:fs/promises";
import { MAX_OTHER_FILE_BYTES } from "../other-policy.mjs";
import { readHandleUpToLimit } from "../read-file-up-to-limit.mjs";
import { readFileFromHandle } from "../read-file-from-handle.mjs";

export async function readInventoryFile(
  filePath,
  relativePath,
  { readOtherFileContents, inspectFile = lstat, openFile = open } = {},
) {
  const metadata = await inspectFile(filePath, { bigint: true });
  if (metadata.isSymbolicLink())
    throw new Error(`symlinked inventory files are not supported: ${relativePath}`);
  if (!metadata.isFile()) throw new Error(`inventory path is not a regular file: ${relativePath}`);
  if (readOtherFileContents) return readOtherFileContents(filePath);
  return readFileFromHandle(filePath, {
    openFile,
    readHandle: (handle) => readHandleUpToLimit(handle, MAX_OTHER_FILE_BYTES),
  });
}
