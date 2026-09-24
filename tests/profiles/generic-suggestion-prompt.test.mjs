import { createGenericSuggestionPrompt } from "../../src/profiles/generic-suggestion-prompt.mjs";

test("creates a generic suggestion prompt for the requested profile", () => {
  const prompt = createGenericSuggestionPrompt("architecture");
  expect(prompt.tools[0].name).toBe("submit_suggestions");
  expect(prompt.input[1].content[0].text).toContain(
    "Profile focus: suggest actionable improvements",
  );
  expect(prompt.input[1].content[0].text).toContain("architecture profile");
});
