import { createAllPrompt } from "../../src/prompts/all.mjs";

test("creates the comprehensive all-profile focus", () => {
  const result = createAllPrompt((focus) => ({ focus }));
  expect(result.focus).toContain("Completeness is the main goal.");
  expect(result.focus).toContain("If the evidence supports 100 issues, report all 100.");
  expect(result.focus).toContain("Do not stop after the first issue in a category.");
  expect(result.focus).toContain("Do not give a sample.");
});
