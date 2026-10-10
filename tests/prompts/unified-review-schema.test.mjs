import { createUnifiedReviewParameters } from "../../src/prompts/unified-review-schema.mjs";

test("defines the unified issue shape", () => {
  const parameters = createUnifiedReviewParameters(["correctness"]);

  expect(parameters.required).toEqual(["issues", "verdict"]);
  expect(parameters.properties.issues.properties.correctness).toMatchObject({
    type: "array",
    minItems: 1,
    items: { $ref: "#/$defs/issue" },
  });
  expect(parameters.$defs.issue.required).toEqual(["severity", "locations", "issues"]);
  expect(parameters.$defs.issue.properties.locations).toMatchObject({
    type: "array",
    minItems: 1,
    items: { type: "string" },
  });
  expect(parameters.$defs.issue.properties.issues).toMatchObject({
    type: "array",
    minItems: 1,
    items: { type: "string" },
  });
  expect(parameters.$defs.issue.properties.severity.enum).toEqual(["P0", "P1", "P2", "P3", "none"]);
  expect(parameters.$defs.issue.properties).not.toHaveProperty("recommendation");
  expect(parameters.$defs.issue.properties).not.toHaveProperty("rationale");
  expect(parameters.$defs.issue.properties).not.toHaveProperty("ignore_example");
});
