import { scopePolicy } from "../../../src/prompts/policy/scope.mjs";

test("requires evidence and respects precise documented scope", () => {
  expect(scopePolicy).toContain("Use supplied specifications and nearby documentation");
  expect(scopePolicy).toContain("check the related code, tests, specifications, and documentation");
  expect(scopePolicy).toContain("near the cited code");
  expect(scopePolicy).toContain("Report only the part that remains unhandled");
  expect(scopePolicy).toContain("separate defect");
});
