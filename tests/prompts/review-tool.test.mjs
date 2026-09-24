import { createReviewTool, reviewTool } from "../../src/prompts/review-tool.mjs";

test("creates strict review tools with required categories", () => {
  expect(reviewTool.name).toBe("submit_review");
  const parameters = createReviewTool(["security"]).parameters;
  expect(parameters.properties.issues.required).toEqual(["security"]);
  expect(parameters.$defs.issue.properties.rationale).toMatchObject({
    type: "array",
    items: { type: "string" },
  });
});
