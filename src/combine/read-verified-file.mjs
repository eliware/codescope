import { open } from "node:fs/promises";

export async function readVerifiedFile(
  filePath,
  inspectedMetadata,
  {
    openFile = open,
    readHandle,
    label,
    changedWhileOpening = `${label} file changed while opening`,
    changedWhileReading = `${label} file changed while reading`,
  },
) {
  const handle = await openFile(filePath, "r");
  try {
    const openedMetadata = await handle.stat({ bigint: true });
    if (!openedMetadata.isFile()) throw new Error(`${label} path is not a regular file`);
    if (
      BigInt(inspectedMetadata.dev) !== openedMetadata.dev ||
      BigInt(inspectedMetadata.ino) !== openedMetadata.ino
    )
      throw new Error(changedWhileOpening);
    const result = await readHandle(handle);
    const readMetadata = await handle.stat({ bigint: true });
    if (
      openedMetadata.dev !== readMetadata.dev ||
      openedMetadata.ino !== readMetadata.ino ||
      openedMetadata.size !== readMetadata.size ||
      openedMetadata.mtimeNs !== readMetadata.mtimeNs ||
      openedMetadata.ctimeNs !== readMetadata.ctimeNs
    )
      throw new Error(changedWhileReading);
    return result;
  } finally {
    await handle.close();
  }
}
