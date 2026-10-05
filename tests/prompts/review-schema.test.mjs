import { createReviewParameters } from "../../src/prompts/review-schema.mjs";

test("defines empty review categories and auditable finding assessments", () => {
  const parameters = createReviewParameters(["correctness", "conventions"]);
  expect(parameters.required).toEqual(["findings", "reviewed_prior_findings", "verdict"]);
  expect(parameters.properties.findings.required).toEqual(["correctness", "conventions"]);
  expect(parameters.properties.findings.properties.correctness).toEqual({
    type: "array",
    items: { $ref: "#/$defs/finding" },
  });
  expect(parameters.properties.findings.description).toContain("empty array");
  expect(parameters.properties.reviewed_prior_findings.description).toContain(
    "One assessment per initial finding ID",
  );
  expect(parameters.properties.reviewed_prior_findings.items).toEqual({
    $ref: "#/$defs/assessment",
  });
  expect(parameters.$defs.finding.required).toEqual([
    "id",
    "severity",
    "location",
    "issue",
    "evidence",
    "impact",
  ]);
  expect(parameters.$defs.finding.properties.severity.enum).toEqual(["P0", "P1", "P2", "P3"]);
  expect(parameters.$defs.finding.properties.evidence.description).toContain("supplied code");
  expect(parameters.$defs.assessment.properties.classification.enum).toEqual([
    "real",
    "partially_real",
    "false_positive",
  ]);
  expect(parameters.$defs.assessment.required).toEqual(["id", "classification", "basis"]);
});
