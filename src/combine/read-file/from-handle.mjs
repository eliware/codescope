import { open } from "node:fs/promises";

export async function readFileFromHandle(filePath, { openFile = open, readHandle }) {
  const handle = await openFile(filePath, "r");
  try {
    return await readHandle(handle);
  } finally {
    await handle.close();
  }
}
