import { findFiles } from "../find/files.mjs";
import { matchesFile } from "../find/extensions.mjs";
import { isGeneratedArtifactPath } from "./content-path.mjs";

export async function selectFiles(
  root,
  extension,
  { files, readDirectory, noTests = false, testsOnly = false, platform = process.platform },
) {
  return files
    ? files.filter(
        (relativePath) =>
          !isGeneratedArtifactPath(relativePath) &&
          matchesFile(relativePath.split(/[\\/]/u).at(-1), extension, testsOnly, noTests),
      )
    : (await findFiles(root, extension, { readDirectory, noTests, testsOnly, platform })).filter(
        (relativePath) => !isGeneratedArtifactPath(relativePath),
      );
}
