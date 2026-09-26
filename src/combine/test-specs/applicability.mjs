import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { readVerifiedFile } from "../read-verified-file.mjs";

const isSafeProfileName = (name) =>
  typeof name === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name);

export async function readTestSpecApplicability(
  root,
  { readPackageJson, inspectFile = lstat, openFile = open } = {},
) {
  const packagePath = path.join(root, "package.json");
  let contents;
  if (readPackageJson) {
    try {
      contents = await readPackageJson(packagePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
      return { kind: "unavailable", reason: "package.json could not be read" };
    }
  } else {
    let metadata;
    try {
      metadata = await inspectFile(packagePath, { bigint: true });
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
      return { kind: "unavailable", reason: "package.json could not be read" };
    }
    if (metadata.isSymbolicLink() || !metadata.isFile())
      return { kind: "unavailable", reason: "package.json is not a regular file" };
    try {
      contents = await readVerifiedFile(packagePath, metadata, {
        openFile,
        label: "package.json",
        readHandle: (handle) => handle.readFile({ encoding: "utf8" }),
      });
    } catch {
      return { kind: "unavailable", reason: "package.json could not be read" };
    }
  }

  let packageJson;
  try {
    packageJson = JSON.parse(contents);
  } catch {
    return { kind: "invalid", reason: "package.json is not valid JSON" };
  }
  if (!packageJson || typeof packageJson !== "object" || Array.isArray(packageJson))
    return { kind: "invalid", reason: "package.json must contain an object" };

  if (packageJson.name === "@eliware/test") return { kind: "available", skipSeparateRecords: true };

  const apply = packageJson.eliware?.apply;
  if (!Array.isArray(apply) || !apply.every(isSafeProfileName))
    return {
      kind: "invalid",
      reason: "package.json eliware.apply must contain safe, single-segment profile names",
    };
  return {
    kind: "available",
    skipSeparateRecords: false,
    profiles: new Set(apply),
    canonicalPaths: new Map(apply.map((name) => [name, `${name}.json`])),
  };
}
