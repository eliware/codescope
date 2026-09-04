import { validateEntryNames } from './entries.mjs';

export async function readDirectoryEntries(readDirectory, directory, root, pathApi) {
  let entries;
  try {
    entries = await readDirectory(directory, { withFileTypes: true });
  } catch (cause) {
    throw new Error(
      `Unable to scan ${pathApi.relative(root, directory) || '.'}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
  if (!Array.isArray(entries))
    throw new Error(
      `Unable to scan ${pathApi.relative(root, directory) || '.'}: directory reader returned a non-array`,
    );
  validateEntryNames(entries, pathApi.relative(root, directory));
  return entries.sort(
    (left, right) => Number(left.name > right.name) - Number(left.name < right.name),
  );
}
