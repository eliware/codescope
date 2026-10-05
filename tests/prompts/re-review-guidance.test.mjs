import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("requires findings to survive evidence review and gives the issue sentinel", () => {
  const instructions = createReviewFollowUpInstructions("issue");
  expect(instructions).toContain("repeat it verbatim");
  expect(instructions).toContain("correct only what is needed");
  expect(instructions).toContain(
    "Never preserve a finding while also explaining that it is not an issue",
  );
  expect(instructions).toContain('issue "No issues found."');
});

test("uses the unified finding field in the sentinel", () => {
  expect(createReviewFollowUpInstructions("finding")).toContain('finding "No issues found."');
});
