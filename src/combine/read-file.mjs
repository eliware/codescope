import { lstat, open, readFile } from "node:fs/promises";
import { readFileFromHandle } from "./read-file-from-handle.mjs";
import { readHandleUpToChars } from "./read-handle-up-to-chars.mjs";

export async function readSourceFile(
  relativePath,
  rootPath,
  {
    readFileContents = readFile,
    inspectFile = lstat,
    openFile = open,
    validateSymlinks = false,
    maxChars = Number.POSITIVE_INFINITY,
  } = {},
) {
  try {
    let metadata;
    if (readFileContents === readFile || validateSymlinks) {
      metadata = await inspectFile(rootPath, { bigint: true });
      if (metadata.isSymbolicLink()) throw new Error("symlinked source files are not supported");
      if (!metadata.isFile()) throw new Error("source path is not a regular file");
    }
    const contents =
      readFileContents === readFile
        ? await readInspectedSourceFile(rootPath, openFile, maxChars)
        : await readFileContents(rootPath, "utf8");
    if (typeof contents !== "string") throw new Error("file reader returned non-string content");
    return contents;
  } catch (cause) {
    throw new Error(
      `Unable to read ${relativePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}

async function readInspectedSourceFile(rootPath, openFile, maxChars) {
  return readFileFromHandle(rootPath, {
    openFile,
    readHandle: (handle) =>
      Number.isFinite(maxChars) ? readHandleUpToChars(handle, maxChars) : handle.readFile("utf8"),
  });
}
