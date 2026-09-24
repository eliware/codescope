import { lstat, open, readFile } from "node:fs/promises";

export async function readSourceFile(
  relativePath,
  rootPath,
  {
    readFileContents = readFile,
    inspectFile = lstat,
    openFile = open,
    validateSymlinks = false,
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
        ? await readInspectedSourceFile(rootPath, metadata, openFile)
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

async function readInspectedSourceFile(rootPath, inspectedMetadata, openFile) {
  const handle = await openFile(rootPath, "r");
  try {
    const openedMetadata = await handle.stat({ bigint: true });
    if (!openedMetadata.isFile()) throw new Error("source path is not a regular file");
    if (
      BigInt(inspectedMetadata.dev) !== openedMetadata.dev ||
      BigInt(inspectedMetadata.ino) !== openedMetadata.ino
    )
      throw new Error("source file changed while opening");
    return await handle.readFile("utf8");
  } finally {
    await handle.close();
  }
}
