export function isSafeProfileName(name) {
  return typeof name === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name);
}
