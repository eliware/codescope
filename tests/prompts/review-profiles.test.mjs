import { createReviewProfiles } from "../../src/prompts/review-profiles.mjs";

test("builds the focused review profile prompts", () => {
  const profiles = createReviewProfiles({
    profilePrompt: (focus) => ({ focus }),
    reviewTool: { name: "submit_review" },
  });
  expect(Object.keys(profiles)).toEqual(["prompt", "refactorPrompt", "reviewTool"]);
  expect(profiles.prompt.focus).toContain("actionable implementation issues");
  expect(profiles.refactorPrompt.focus).toContain("monolithic-file");
});
