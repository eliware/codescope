import { readFile } from "node:fs/promises";

const isSafeProfileName = (name) =>
  typeof name === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name);

export async function readTestSpecApplicability(root, { readPackageJson = readFile } = {}) {
  let contents;
  try {
    contents = await readPackageJson(`${root}/package.json`, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
    return { kind: "invalid", reason: "package.json could not be read" };
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
