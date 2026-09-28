import { createReviewPromptSources } from "../../../src/profiles/prompt-sources/review.mjs";

test("registers the review-family prompt sources", () => {
  const profilePrompt = (focus) => ({ focus });
  const result = createReviewPromptSources(profilePrompt);
  expect(Object.keys(result.sources)).toEqual(["conventions", "refactor"]);
  expect(result.defaultPrompt.focus).toContain("actionable implementation issues");
});
