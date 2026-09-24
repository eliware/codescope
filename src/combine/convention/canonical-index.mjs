import { readFile } from "node:fs/promises";
import path from "node:path";
import { readSourceFile } from "../read-file.mjs";

export function parseCanonicalDirectiveIndex(contents) {
  const records = [];
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*-\s+\[([^\]]+\.json)\]\(([^)\s]+\.json)\)\s*$/iu);
    if (match && match[1] === match[2]) {
      const relativePath = normalizeRelativeJsonTarget(match[2]);
      if (relativePath) records.push(relativePath);
    }
  }
  return [...new Set(records)];
}

export async function readCanonicalDirectiveIndex(
  specsRoot,
  { readFileContents = readFile, inspectFile, platform = process.platform } = {},
) {
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  const indexPath = pathApi.resolve(specsRoot, "README.md");
  let contents;
  try {
    contents = await readSourceFile("conventions/specs/README.md", indexPath, {
      readFileContents,
      inspectFile,
      validateSymlinks: true,
    });
  } catch (cause) {
    if (hasErrorCode(cause, "ENOENT")) return undefined;
    throw cause;
  }
  const records = parseCanonicalDirectiveIndex(contents);
  return records.length > 0 ? records : undefined;
}

function normalizeRelativeJsonTarget(target) {
  if (target.includes("\\") || target.startsWith("/") || /^[a-z][a-z\d+.-]*:/iu.test(target))
    return undefined;
  if (target.split("/").includes("..")) return undefined;
  return path.posix.normalize(target);
}

function hasErrorCode(error, code) {
  const visited = new Set();
  for (let current = error; current && !visited.has(current); current = current.cause) {
    visited.add(current);
    if (current.code === code) return true;
  }
  return false;
}
