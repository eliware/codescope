import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("assesses every prior ID and preserves supported portions under the initial threshold", () => {
  const instructions = createReviewFollowUpInstructions();
  expect(instructions).toContain(
    "same reporting threshold and priority rules as the initial review",
  );
  expect(instructions).toContain("real, partially_real, or false_positive");
  expect(instructions).toContain("retain the finding under its original ID");
  expect(instructions).toContain(
    "Passing tests, absence of a dedicated test, or uncertainty alone",
  );
  expect(instructions).toContain("exactly one assessment for every initial finding ID");
  expect(instructions).toContain("Use empty arrays where no findings survive");
  expect(instructions).not.toContain("material defect");
});
