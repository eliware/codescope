import { createSuggestionTool } from "../../src/profiles/suggestion-tool.mjs";

test("builds the default suggestion schema", () => {
  const tool = createSuggestionTool();
  expect(tool.parameters.properties.suggestions.required).toContain("new-features");
});

test("builds a suggestion schema for selected categories", () => {
  const tool = createSuggestionTool(["security"]);
  expect(tool.parameters.properties.suggestions.required).toEqual(["security"]);
});
