import {
  isAbsolutePortablePath,
  resolveConfigPath,
  selectConfigFiles,
} from "../../../src/combine/config/paths.mjs";

test("selects config entries not owned by another content section", () => {
  expect(
    selectConfigFiles([
      "README.md",
      ".github/workflow.yml",
      ".github/settings.json",
      ".github/readme.md",
      ".github/script.mjs",
      ".github/script.test.mjs",
      ".github/setup.cfg",
      ".knit/check.mjs",
    ]),
  ).toEqual([".github/setup.cfg"]);
});

test("rejects absolute and escaping configuration paths", () => {
  expect(isAbsolutePortablePath("C:/outside")).toBe(true);
  expect(isAbsolutePortablePath("/outside")).toBe(true);
  expect(isAbsolutePortablePath("//server/share")).toBe(true);
  expect(isAbsolutePortablePath("relative/path")).toBe(false);
  expect(isAbsolutePortablePath("\\\\server\\share")).toBe(true);
  expect(() => resolveConfigPath("repo", "../outside", "posix")).toThrow(/escapes/);
  expect(() => resolveConfigPath("C:\\repo", "..\\outside", "win32")).toThrow(/escapes/);
  expect(resolveConfigPath("repo", ".github/ci.yml", "posix")).toContain("repo");
  expect(resolveConfigPath("C:\\repo", ".github\\ci.yml", "win32")).toContain("repo");
  expect(resolveConfigPath("repo", ".github/ci.yml")).toContain("repo");
});

test("ignores unrelated inventory entries", () => {
  expect(selectConfigFiles([".github", ".knit", "src/app.mjs"])).toEqual([]);
});

test("preserves literal backslashes in POSIX inventory filenames", () => {
  expect(selectConfigFiles([".github\\settings.cfg"], "linux")).toEqual([]);
  expect(resolveConfigPath("/repo", ".github\\ci.cfg", "linux")).toBe("/repo/.github\\ci.cfg");
});
