import { createReviewTool, reviewTool } from "../../src/prompts/review-tool.mjs";

test("creates strict review tools with selected categories", () => {
  expect(reviewTool.name).toBe("submit_review");
  const parameters = createReviewTool(["security"]).parameters;
  expect(parameters.properties.issues.required).toEqual(["security"]);
});
