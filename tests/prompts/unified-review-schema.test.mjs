import { createUnifiedReviewParameters } from "../../src/prompts/unified-review-schema.mjs";

test("defines the October 3 unified finding shape without removed fields", () => {
  const parameters = createUnifiedReviewParameters(["correctness"]);

  expect(parameters.required).toEqual(["findings", "verdict"]);
  expect(parameters.properties.findings.properties.correctness).toMatchObject({
    type: "array",
    minItems: 1,
  });
  expect(parameters.$defs.finding.required).toEqual(["severity", "location", "finding"]);
  expect(parameters.$defs.finding.properties.severity.enum).toEqual([
    "P0",
    "P1",
    "P2",
    "P3",
    "none",
  ]);
  expect(parameters.$defs.finding.properties).not.toHaveProperty("recommendation");
  expect(parameters.$defs.finding.properties).not.toHaveProperty("rationale");
  expect(parameters.$defs.finding.properties).not.toHaveProperty("ignore_example");
});
