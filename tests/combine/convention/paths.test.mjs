import {
  normalizeConventionPath,
  resolveConventionPath,
} from "../../../src/combine/convention/paths.mjs";

test("normalizes and resolves convention paths safely", () => {
  expect(normalizeConventionPath("General\\Spec.JSON")).toBe("general/spec.json");
  const linuxPath = resolveConventionPath("repo/specs", "general.json", "posix");
  const windowsPath = resolveConventionPath("C:\\repo\\specs", "general\\file.json", "win32");
  const hostPath = resolveConventionPath("repo/specs", "general.json");
  expect(linuxPath).toContain("repo");
  expect(windowsPath).toContain("repo");
  expect(hostPath).toContain("repo");
  expect(() => resolveConventionPath("repo/specs", "../outside", "posix")).toThrow(/escapes/);
});
