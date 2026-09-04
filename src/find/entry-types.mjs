export function classifyEntry(entry, relativeDirectory) {
  const location = relativeDirectory || '.';
  try {
    if (typeof entry.isSymbolicLink === 'function' && entry.isSymbolicLink()) return { skip: true };
    const isDirectory = typeof entry.isDirectory === 'function' && entry.isDirectory();
    const isFile = typeof entry.isFile === 'function' && entry.isFile();
    if (isDirectory && isFile) throw new Error(`Invalid directory entry in ${location}`);
    if (!isDirectory && !isFile) throw new Error(`Invalid directory entry in ${location}`);
    return { isDirectory, isFile, skip: false };
  } catch (cause) {
    if (cause instanceof Error && cause.message.startsWith('Invalid directory entry')) throw cause;
    throw new Error(
      `Unable to scan ${location}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
