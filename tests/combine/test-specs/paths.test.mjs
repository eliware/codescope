import path from "node:path";
import {
  normalizeTestSpecPath,
  resolveTestSpecPath,
} from "../../../src/combine/test-specs/paths.mjs";

test("normalizes Test spec paths and resolves platform-specific targets", () => {
  expect(normalizeTestSpecPath("General\\Spec.JSON")).toBe("general/spec.json");
  expect(resolveTestSpecPath("repo/specs", "general.json", "posix")).toBe(
    path.posix.resolve("repo/specs/general.json"),
  );
  expect(resolveTestSpecPath("C:\\repo\\specs", "general\\file.json", "win32")).toBe(
    path.win32.resolve("C:\\repo\\specs", "general\\file.json"),
  );
  expect(resolveTestSpecPath("repo/specs", "general.json")).toBe(
    path.resolve("repo/specs/general.json"),
  );
});

test("rejects Test spec paths escaping the specs directory", () => {
  expect(() => resolveTestSpecPath("repo/specs", "../outside", "posix")).toThrow(/escapes/);
});
