import { formatInventoryEntry } from "../format/entry.mjs";
import { resolveInventoryPath } from "../paths.mjs";
import { readInventoryFile } from "./file.mjs";
import { validateInventorySample } from "../validate/sample.mjs";
import { formatEnvironmentFileEntry, isEnvironmentFile } from "../environment-entry.mjs";

export async function readInventoryEntry(
  rootPath,
  relativePath,
  { pathApi, readOtherFileContents, inspectFile, openFile, executeGit },
) {
  const filePath = resolveInventoryPath(rootPath, relativePath, pathApi);
  if (isEnvironmentFile(relativePath))
    return formatEnvironmentFileEntry(rootPath, filePath, relativePath, {
      inspectFile,
      executeGit,
    });

  const result = await readInventoryFile(filePath, relativePath, {
    readOtherFileContents,
    inspectFile,
    openFile,
  });
  return formatInventoryEntry(relativePath, validateInventorySample(result));
}
