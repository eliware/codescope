import path from "node:path";
import {
  normalizeTestSpecPath,
  resolveTestSpecPath,
} from "../../../src/combine/test-specs/paths.mjs";

test("normalizes Test spec paths and resolves platform-specific targets", () => {
  expect(normalizeTestSpecPath("General\\Spec.YAML")).toBe("general/spec.yaml");
  expect(resolveTestSpecPath("repo/specs", "general.yaml", "posix")).toBe(
    path.posix.resolve("repo/specs/general.yaml"),
  );
  expect(resolveTestSpecPath("C:\\repo\\specs", "general\\file.yaml", "win32")).toBe(
    path.win32.resolve("C:\\repo\\specs", "general\\file.yaml"),
  );
  expect(resolveTestSpecPath("repo/specs", "general.yaml")).toBe(
    path.resolve("repo/specs/general.yaml"),
  );
});

test("rejects Test spec paths escaping the specs directory", () => {
  expect(() => resolveTestSpecPath("repo/specs", "../outside", "posix")).toThrow(/escapes/);
});
