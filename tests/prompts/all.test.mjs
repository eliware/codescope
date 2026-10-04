import { createAllPrompt } from "../../src/prompts/all.mjs";

test("creates the comprehensive all-profile focus", () => {
  const result = createAllPrompt((focus) => ({ focus }));
  expect(result.focus).toContain("Review the full supplied repository context");
  expect(result.focus).toContain("every distinct actionable issue");
  expect(result.focus).toContain("Do not return a sample");
  expect(result.focus.length).toBeLessThan(200);
});
