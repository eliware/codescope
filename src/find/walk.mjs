export async function walkDirectories(
  root,
  { readEntries, classify, shouldDescend, onFile, resolveChild, concurrency = 8 },
) {
  const pending = [root];
  const files = [];
  while (pending.length > 0) {
    const batch = pending.splice(Math.max(0, pending.length - concurrency));
    const results = await Promise.all(
      batch.map(async (directory) => ({
        directory,
        entries: await readEntries(directory, root),
      })),
    );
    for (const { directory, entries } of results) {
      for (const entry of entries) {
        const entryType = classify(entry, directory, root);
        if (entryType.skip) continue;
        const childPath = resolveChild(directory, entry.name);
        if (entryType.isDirectory && shouldDescend(entry.name, directory, root))
          pending.push(childPath);
        else if (entryType.isFile) files.push({ name: entry.name, directory });
      }
    }
  }
  files
    .sort((left, right) => `${left.directory}/${left.name}`.localeCompare(`${right.directory}/${right.name}`))
    .forEach(({ name, directory }) => onFile(name, directory, root));
}
