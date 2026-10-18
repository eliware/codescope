import { readFile } from "node:fs/promises";
import { createReadCache } from "../read/cache.mjs";

export function createAllReadOptions(options, defaultReader = readFile) {
  if (options.readFileContents === defaultReader) return options;
  return { ...options, readFileContents: createReadCache(options.readFileContents) };
}
