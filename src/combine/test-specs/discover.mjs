import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import { findFiles } from "../../find/files.mjs";

export async function discoverTestSpecFiles(
  testRoot,
  { readDirectory, inspectRoot = lstat, platform = process.platform } = {},
) {
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  const specsRoot = pathApi.join(testRoot, "specs", "conventions");
  if (readDirectory === undefined || readDirectory === readdir) {
    try {
      await inspectRoot(specsRoot);
    } catch (cause) {
      if (cause?.code === "ENOENT") return undefined;
      throw new Error(`Unable to inspect Test specification evidence: ${String(cause)}`, {
        cause,
      });
    }
  }
  try {
    return {
      specsRoot,
      files: await findFiles(specsRoot, ".yaml", { readDirectory, platform }),
    };
  } catch (cause) {
    throw new Error(`Unable to discover Test specification evidence: ${String(cause)}`, { cause });
  }
}
