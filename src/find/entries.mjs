export function validateEntryNames(entries, relativeDirectory) {
  for (const entry of entries) {
    if (
      typeof entry.name !== 'string' ||
      !entry.name ||
      entry.name === '.' ||
      entry.name === '..' ||
      entry.name.includes('/') ||
      entry.name.includes('\\')
    )
      throw new Error(`Invalid directory entry name in ${relativeDirectory || '.'}`);
  }
}
