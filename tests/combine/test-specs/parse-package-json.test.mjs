import { parsePackageJson } from "../../../src/combine/test-specs/parse-package-json.mjs";

test("parses package objects", () => {
  expect(parsePackageJson('{"name":"project"}')).toEqual({
    kind: "available",
    packageJson: { name: "project" },
  });
});

test("rejects malformed JSON and non-object package values", () => {
  expect(parsePackageJson("{")).toEqual({
    kind: "invalid",
    reason: "package.json is not valid JSON",
  });
  expect(parsePackageJson("[]")).toEqual({
    kind: "invalid",
    reason: "package.json must contain an object",
  });
  expect(parsePackageJson("null")).toEqual({
    kind: "invalid",
    reason: "package.json must contain an object",
  });
});
