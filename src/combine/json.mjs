import { readFile } from "node:fs/promises";
import { findFiles } from "../find/files.mjs";
import { getBatchSize } from "./limits.mjs";
import { readBatches } from "./batches.mjs";
import { isIncludedJson } from "./json/policy.mjs";
import { createJsonSectionReader } from "./json/read-section.mjs";
export async function combineJsonFiles(
  root,
  {
    readDirectory,
    readFileContents = readFile,
    inspectFile,
    validateSymlinks = false,
    concurrency = 16,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  const files = (await findFiles(root, ".json", { readDirectory, platform })).filter(
    isIncludedJson,
  );
  const sections = await readBatches(files, {
    batchSize: getBatchSize(concurrency),
    maxChars,
    read: createJsonSectionReader(root, {
      readFileContents,
      inspectFile,
      validateSymlinks,
      maxChars,
      platform,
    }),
  });
  return sections.join("\n");
}
