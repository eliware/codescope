export function createReadCache(readFileContents) {
  if (!readFileContents) return undefined;
  const cache = new Map();
  return async (filePath, encoding) => {
    const key = `${filePath}\u0000${encoding ?? ''}`;
    if (cache.has(key)) return cache.get(key);
    const pending = Promise.resolve(readFileContents(filePath, encoding));
    cache.set(key, pending);
    try {
      return await pending;
    } catch (cause) {
      cache.delete(key);
      throw cause;
    }
  };
}
