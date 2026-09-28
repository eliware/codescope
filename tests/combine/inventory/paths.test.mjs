import path from "node:path";
import {
  resolveInventoryPath,
  selectInventoryFiles,
} from "../../../src/combine/inventory/paths.mjs";

test("filters included content and normalizes separators", () => {
  expect(
    selectInventoryFiles(
      "repo",
      ["src\\a.mjs", "package.json"],
      path.posix,
      (file) => file === "package.json",
    ),
  ).toEqual(["src/a.mjs"]);
});

test("rejects absolute and escaping inventory paths", () => {
  expect(() => resolveInventoryPath("repo", "/outside", path.posix)).toThrow(/escapes/);
  expect(() => resolveInventoryPath("repo", "../outside", path.posix)).toThrow(/escapes/);
});

test("applies native root semantics for explicit Windows and POSIX path APIs", () => {
  expect(() => resolveInventoryPath("C:\\repo", "..\\outside", path.win32)).toThrow(/escapes/);
  expect(resolveInventoryPath("/repo", "nested\\file.txt", path.posix)).toBe(
    "/repo/nested/file.txt",
  );
});

test("rejects non-string inventory paths and normalizes Windows separators", () => {
  expect(() => selectInventoryFiles("repo", [42], path.posix, () => false)).toThrow(
    /must be strings/,
  );
  expect(selectInventoryFiles("repo", ["nested\\notes.txt"], path.posix, () => false)).toEqual([
    "nested/notes.txt",
  ]);
});

test("keeps equal normalized paths deterministic", () => {
  expect(selectInventoryFiles("repo", ["same.txt", "same.txt"], path.posix, () => false)).toEqual([
    "same.txt",
    "same.txt",
  ]);
});

test("sorts normalized inventory paths independently of input order", () => {
  expect(
    selectInventoryFiles("repo", ["z.txt", "a.txt", "m.txt"], path.posix, () => false),
  ).toEqual(["a.txt", "m.txt", "z.txt"]);
});
