import { createReadCache } from './read-cache.mjs';

export function createAllReadOptions(options) {
  return { ...options, readFileContents: createReadCache(options.readFileContents) };
}
