import { createReviewTool } from "../../src/profiles/review-tool.mjs";

test("builds the default review schema", () => {
  const tool = createReviewTool();
  expect(tool.parameters.properties.issues.required).toContain("conventions");
  expect(tool.parameters.$defs.issue.properties.evidence.type).toBe("string");
});

test("builds a review schema for selected categories", () => {
  const tool = createReviewTool(["tests"]);
  expect(tool.parameters.properties.issues.required).toEqual(["tests"]);
});
