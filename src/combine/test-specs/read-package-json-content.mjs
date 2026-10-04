import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { readFileFromHandle } from "../read-file-from-handle.mjs";
import { readHandleUpToLimit } from "../read-file-up-to-limit.mjs";

export const MAX_PACKAGE_JSON_BYTES = 100_000;

export async function readPackageJsonContent(
  root,
  { readPackageJson, inspectFile = lstat, openFile = open } = {},
) {
  const packagePath = path.join(root, "package.json");
  if (readPackageJson) return readInjectedPackageJson(readPackageJson, packagePath);
  return readInspectedPackageJson(packagePath, inspectFile, openFile);
}

async function readInjectedPackageJson(readPackageJson, packagePath) {
  try {
    const result = await readPackageJson(packagePath, "utf8", {
      maxBytes: MAX_PACKAGE_JSON_BYTES,
    });
    const bounded = typeof result === "string" ? { data: result } : result;
    const contents =
      typeof bounded?.data === "string"
        ? bounded.data
        : Buffer.isBuffer(bounded?.data)
          ? decodePackageJsonBytes(bounded.data)
          : undefined;
    if (
      typeof contents !== "string" ||
      bounded?.truncated === true ||
      Buffer.byteLength(contents) > MAX_PACKAGE_JSON_BYTES
    )
      return { kind: "unavailable", reason: "package.json exceeds the 100000-byte read limit" };
    return { kind: "available", contents };
  } catch (error) {
    return packageReadFailure(error);
  }
}

async function readInspectedPackageJson(packagePath, inspectFile, openFile) {
  let metadata;
  try {
    metadata = await inspectFile(packagePath, { bigint: true });
  } catch (error) {
    return packageReadFailure(error);
  }
  if (metadata.isSymbolicLink() || !metadata.isFile())
    return { kind: "unavailable", reason: "package.json is not a regular file" };
  try {
    const result = await readFileFromHandle(packagePath, {
      openFile,
      readHandle: (handle) => readHandleUpToLimit(handle, MAX_PACKAGE_JSON_BYTES),
    });
    if (result.truncated)
      return { kind: "unavailable", reason: "package.json exceeds the 100000-byte read limit" };
    return { kind: "available", contents: decodePackageJsonBytes(result.data) };
  } catch {
    return { kind: "unavailable", reason: "package.json could not be read" };
  }
}

function decodePackageJsonBytes(bytes) {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}

function packageReadFailure(error) {
  if (error?.code === "ENOENT") return null;
  return { kind: "unavailable", reason: "package.json could not be read" };
}
