import { isIncludedJson } from "../../../src/combine/json/policy.mjs";

test("includes repository JSON except package metadata and lockfiles", () => {
  expect(isIncludedJson("root.json")).toBe(true);
  expect(isIncludedJson("specs/contract.json")).toBe(true);
  expect(isIncludedJson("examples/config.json")).toBe(true);
  expect(isIncludedJson("examples/nested/SAMPLE.JSON")).toBe(true);
  expect(isIncludedJson("examples\\nested\\sample.json")).toBe(true);
  expect(isIncludedJson("src/data.json")).toBe(true);
  expect(isIncludedJson("packages/tool/package.json")).toBe(true);
  expect(isIncludedJson("packages/tool/package-lock.json")).toBe(false);
  expect(isIncludedJson("packages/tool/package-lock.JSON")).toBe(false);
  expect(isIncludedJson("package-lock.json")).toBe(false);
  expect(isIncludedJson("PACKAGE-LOCK.JSON")).toBe(false);
  expect(isIncludedJson("tmp/private.json")).toBe(true);
});
