import { createProfilePrompt, getPromptSource } from "../../../src/profiles/prompt/sources.mjs";

test("owns profile prompt-source registration", () => {
  for (const profile of [
    "conventions",
    "refactor",
    "architecture",
    "new-features",
    "security",
    "performance",
    "reliability",
    "api-design",
    "dependencies",
    "observability",
    "accessibility",
    "quick-wins",
    "prioritize",
    "p0",
    "p0-1",
    "p0-2",
    "p0-3",
  ]) {
    expect(getPromptSource(profile)).toBeDefined();
  }
  expect(getPromptSource("architecture")).toEqual(
    expect.objectContaining({ input: expect.any(Array) }),
  );
  expect(getPromptSource("missing")).toBeUndefined();
});

test("loads the developer prompt and profile text from Markdown files", () => {
  const prompt = createProfilePrompt("source focus", undefined, { globalReviewInstructions: "" });
  expect(prompt.input[0].content[0].text).toContain("You are CodeScope.");
  expect(prompt.input[1].content[0].text).toContain("Profile focus: source focus");
});

test("uses default profile prompt options", () => {
  const prompt = createProfilePrompt("default focus");
  expect(prompt.input[1].content[0].text).toContain("Profile focus: default focus");
});
