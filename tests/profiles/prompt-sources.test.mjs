import { getPromptSource } from "../../src/profiles/prompt-sources.mjs";

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
