import { readFile } from "node:fs/promises";
import { readBatches } from "../batches.mjs";
import { readSourceFile } from "../read-file.mjs";
import { formatSourceSection } from "../section-format.mjs";
import { normalizeTestSpecPath, resolveTestSpecPath } from "./paths.mjs";

export function readTestSpecRecords(
  specsRoot,
  files,
  {
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    readFileContents = readFile,
    inspectFile,
    platform = process.platform,
  } = {},
) {
  return readBatches(files, {
    batchSize: concurrency,
    maxChars,
    read: async (relativePath) => {
      const portablePath = resolveTestSpecPath(specsRoot, relativePath, platform);
      const contents = await readSourceFile("test/specs/" + relativePath, portablePath, {
        readFileContents,
        inspectFile,
        validateSymlinks: true,
      });
      const normalizedPath = normalizeTestSpecPath(relativePath);
      return formatSourceSection("test/specs/" + normalizedPath, contents);
    },
  });
}
