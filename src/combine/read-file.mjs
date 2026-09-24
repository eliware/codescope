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
    assertSameSourceIdentity(inspectedMetadata, openedMetadata);
    const contents = await handle.readFile("utf8");
    assertStableSourceSnapshot(openedMetadata, await handle.stat({ bigint: true }));
    return contents;
  } finally {
    await handle.close();
  }
}

function assertSameSourceIdentity(expected, actual) {
  if (BigInt(expected.dev) !== actual.dev || BigInt(expected.ino) !== actual.ino)
    throw new Error("source file changed while opening");
}

function assertStableSourceSnapshot(before, after) {
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  )
    throw new Error("source file changed while reading");
}
