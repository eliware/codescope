import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { readFileFromHandle } from "../read-file-from-handle.mjs";

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
    return { kind: "available", contents: await readPackageJson(packagePath, "utf8") };
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
    const contents = await readFileFromHandle(packagePath, {
      openFile,
      readHandle: (handle) => handle.readFile({ encoding: "utf8" }),
    });
    return { kind: "available", contents };
  } catch {
    return { kind: "unavailable", reason: "package.json could not be read" };
  }
}

function packageReadFailure(error) {
  if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
  return { kind: "unavailable", reason: "package.json could not be read" };
}
