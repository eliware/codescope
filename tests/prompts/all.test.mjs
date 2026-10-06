import { createAllPrompt } from "../../src/prompts/all.mjs";

test("creates the comprehensive all-profile focus", () => {
  const result = createAllPrompt((focus) => ({ focus }));
  expect(result.focus).toContain("Review all supplied repository content");
  expect(result.focus).toContain("every separate defect");
  expect(result.focus).toContain("Do not return a sample");
  expect(result.focus.length).toBeLessThan(200);
});
