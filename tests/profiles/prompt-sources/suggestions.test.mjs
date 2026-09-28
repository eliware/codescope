import { createSuggestionPromptSources } from "../../../src/profiles/prompt-sources/suggestions.mjs";

test("registers only the suggestion-family profiles", () => {
  const sources = createSuggestionPromptSources((focus) => ({ focus }));
  expect(Object.keys(sources)).toEqual([
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
  ]);
});
