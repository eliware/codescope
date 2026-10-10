import { createReviewParameters } from "../../src/prompts/review-schema.mjs";

test("defines empty review categories and evidence-backed issues", () => {
  const parameters = createReviewParameters(["correctness", "conventions"]);
  expect(parameters.required).toEqual(["issues", "verdict"]);
  expect(parameters.properties.issues.required).toEqual(["correctness", "conventions"]);
  expect(parameters.properties.issues.properties.correctness).toEqual({
    type: "array",
    items: { $ref: "#/$defs/issue" },
  });
  expect(parameters.properties.issues.description).toContain("empty array");
  expect(parameters.$defs.issue.required).toEqual([
    "severity",
    "locations",
    "issues",
    "evidence",
    "impact",
  ]);
  expect(parameters.$defs.issue.properties.locations).toMatchObject({ type: "array", minItems: 1 });
  expect(parameters.$defs.issue.properties.issues).toMatchObject({ type: "array", minItems: 1 });
  expect(parameters.$defs.issue.properties.severity.enum).toEqual(["P0", "P1", "P2", "P3"]);
  expect(parameters.$defs.issue.properties.evidence.description).toContain("Code and related test");
  expect(parameters.$defs).not.toHaveProperty("assessment");
});
