import path from "node:path";
import { isIncludedContent } from "./other-policy.mjs";
import { readBatches } from "./batches.mjs";
import { readInventoryEntry } from "./inventory/read-entry.mjs";
import { selectInventoryFiles } from "./inventory/paths.mjs";
import { validateInventoryOptions } from "./inventory/validate-options.mjs";
import { formatInventorySectionResult } from "./inventory/format-section.mjs";

export async function describeOtherFiles(
  root,
  inventory,
  {
    readOtherFileContents,
    inspectFile,
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  validateInventoryOptions(concurrency);
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  const paths = selectInventoryFiles(root, inventory, pathApi, isIncludedContent);
  const read = (relativePath) =>
    readInventoryEntry(rootPath, relativePath, { pathApi, readOtherFileContents, inspectFile });
  if (Number.isFinite(maxChars)) {
    const entries = [];
    for (const relativePath of paths) {
      const entry = await read(relativePath);
      const candidate = [...entries, entry];
      if (
        formatInventorySectionResult(candidate, maxChars, paths.length).included < candidate.length
      )
        continue;
      entries.push(entry);
    }
    return { entries, totalEntries: paths.length };
  }
  const entries = await readBatches(paths, { batchSize: concurrency, maxChars: Infinity, read });
  return { entries: entries.filter(Boolean), totalEntries: paths.length };
}
