import { suggestionOutputPolicy } from "../../../src/prompts/policy/suggestion-output-policy.mjs";

test("defines suggestion schema instructions and sentinel values", () => {
  expect(suggestionOutputPolicy).toContain('locations ["none"]');
  expect(suggestionOutputPolicy).toContain('suggestion "No suggestions found."');
  expect(suggestionOutputPolicy).toContain("rationale: []");
  expect(suggestionOutputPolicy).toContain('ignore_example: ""');
  expect(suggestionOutputPolicy).toContain('Start each reason with "Because"');
  expect(suggestionOutputPolicy).toContain("codescope ignore:");
});
