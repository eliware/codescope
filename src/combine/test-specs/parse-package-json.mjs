export function parsePackageJson(contents) {
  let packageJson;
  try {
    packageJson = JSON.parse(contents);
  } catch {
    return { kind: "invalid", reason: "package.json is not valid JSON" };
  }
  if (!packageJson || typeof packageJson !== "object" || Array.isArray(packageJson))
    return { kind: "invalid", reason: "package.json must contain an object" };
  return { kind: "available", packageJson };
}
