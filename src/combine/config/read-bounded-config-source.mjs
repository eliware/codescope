import { open } from "node:fs/promises";
import { readFileFromHandle } from "../read-file-from-handle.mjs";
import { readHandleUpToLimit } from "../read-file-up-to-limit.mjs";

export const MAX_CONFIG_BYTES = 100_000;

export function readBoundedConfigSource(filePath, { readFileContents, openFile = open } = {}) {
  if (readFileContents) return readFileContents(filePath, { maxBytes: MAX_CONFIG_BYTES });
  return readFileFromHandle(filePath, {
    openFile,
    readHandle: (handle) => readHandleUpToLimit(handle, MAX_CONFIG_BYTES),
  });
}
