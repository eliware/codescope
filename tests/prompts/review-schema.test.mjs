import { createReviewParameters } from "../../src/prompts/review-schema.mjs";

test("defines empty review categories and evidence-backed findings", () => {
  const parameters = createReviewParameters(["correctness", "conventions"]);
  expect(parameters.required).toEqual(["findings", "verdict"]);
  expect(parameters.properties.findings.required).toEqual(["correctness", "conventions"]);
  expect(parameters.properties.findings.properties.correctness).toEqual({
    type: "array",
    items: { $ref: "#/$defs/finding" },
  });
  expect(parameters.properties.findings.description).toContain("empty array");
  expect(parameters.$defs.finding.required).toEqual([
    "severity",
    "location",
    "issue",
    "evidence",
    "impact",
  ]);
  expect(parameters.$defs.finding.properties.severity.enum).toEqual(["P0", "P1", "P2", "P3"]);
  expect(parameters.$defs.finding.properties.evidence.description).toContain("supplied code");
  expect(parameters.$defs).not.toHaveProperty("assessment");
});
