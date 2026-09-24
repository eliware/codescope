import { conventionFilesForApplicability } from "./paths.mjs";
import { readCanonicalDirectiveIndex } from "./canonical-index.mjs";

export async function resolveConventionSelection(discovery, applicability, options = {}) {
  const { readFileContents, inspectFile, platform = process.platform } = options;
  const canonicalRecords = applicability.includeAll
    ? await readCanonicalDirectiveIndex(discovery.specsRoot, {
        readFileContents,
        inspectFile,
        platform,
      })
    : undefined;
  return conventionFilesForApplicability(discovery.files, applicability, canonicalRecords);
}
