import { jsonContextPolicy } from "../../../../src/prompts/policy/evidence/json-context.mjs";

test("defines which supplied JSON files are review evidence", () => {
  expect(jsonContextPolicy).toContain("repository root, docs, examples, and specs");
  expect(jsonContextPolicy).toContain("package-lock.json and unsupplied JSON are not");
});
