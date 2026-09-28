import path from "node:path";
import { assertWithinLimit } from "../assert-within-limit.mjs";
import { formatSourceSection } from "../section-format.mjs";
import { readSourceFile } from "../read-file.mjs";
import { resolveJsonPath } from "./paths.mjs";

export function createJsonSectionReader(
  root,
  { readFileContents, inspectFile, validateSymlinks, maxChars, platform = process.platform },
) {
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  const rootPath = pathApi.resolve(root);
  return async (relativePath) => {
    const resolvedPath = resolveJsonPath(rootPath, relativePath, pathApi);
    const contents = await readSourceFile(relativePath, resolvedPath, {
      readFileContents,
      inspectFile,
      validateSymlinks,
    });
    if (Number.isFinite(maxChars)) assertWithinLimit(contents.length, maxChars);
    return formatSourceSection(relativePath, contents);
  };
}
