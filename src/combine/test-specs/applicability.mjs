import { readPackageJsonContent } from "./read-package-json-content.mjs";
import { parsePackageJson } from "./parse-package-json.mjs";
import { isSafeProfileName } from "./is-safe-profile-name.mjs";

export async function readTestSpecApplicability(root, options = {}) {
  const source = await readPackageJsonContent(root, options);
  if (source === null || source.kind !== "available") return source;
  const parsed = parsePackageJson(source.contents);
  if (parsed.kind !== "available") return parsed;
  const { packageJson } = parsed;

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
