export async function walkDirectories(root, {
  readEntries,
  classify,
  shouldDescend,
  onFile,
  resolveChild,
}) {
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    const entries = await readEntries(directory, root);
    for (const entry of entries) {
      const entryType = classify(entry, directory, root);
      if (entryType.skip) continue;
      const childPath = resolveChild(directory, entry.name);
      if (entryType.isDirectory && shouldDescend(entry.name, directory, root)) pending.push(childPath);
      else if (entryType.isFile) onFile(entry.name, directory, root);
    }
  }
}
