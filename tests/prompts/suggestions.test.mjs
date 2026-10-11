import { createImplementationOnlyPrompt } from "../../src/prompts/suggestions.mjs";

test("builds implementation-only suggestion prompts through injected dependencies", () => {
  const prompt = createImplementationOnlyPrompt("Suggest architecture.", {
    profilePrompt: (focus, tool) => ({ focus, tool }),
    suggestionTool: { name: "submit_suggestions" },
  });
  expect(prompt.tool).toEqual({ name: "submit_suggestions" });
  expect(prompt.focus).toContain("Suggest architecture.");
  expect(prompt.focus).toContain("Put at least one item in every category.");
  expect(prompt.focus).toContain("rationale: []");
  expect(prompt.focus).toContain('locations ["none"]');
});
