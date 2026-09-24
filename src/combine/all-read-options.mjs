import { readFile } from "node:fs/promises";
import { createReadCache } from "./read-cache.mjs";

export function createAllReadOptions(options) {
  if (options.readFileContents === readFile) return options;
  return { ...options, readFileContents: createReadCache(options.readFileContents) };
}
