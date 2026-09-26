import { formatInventoryEntry } from "./format-entry.mjs";
import { resolveInventoryPath } from "./paths.mjs";
import { readInventoryFile } from "./read-file.mjs";
import { validateInventorySample } from "./validate-sample.mjs";

export async function readInventoryEntry(
  rootPath,
  relativePath,
  { pathApi, readOtherFileContents, inspectFile, openFile },
) {
  const filePath = resolveInventoryPath(rootPath, relativePath, pathApi);
  const result = await readInventoryFile(filePath, relativePath, {
    readOtherFileContents,
    inspectFile,
    openFile,
  });
  return formatInventoryEntry(relativePath, validateInventorySample(result));
}
