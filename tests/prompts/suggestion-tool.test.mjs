import { createSuggestionTool, suggestionTool } from "../../src/prompts/suggestion-tool.mjs";

test("creates strict suggestion tools with required categories", () => {
  expect(suggestionTool.name).toBe("submit_suggestions");
  const parameters = createSuggestionTool(["tests"]).parameters;
  expect(parameters.properties.suggestions.required).toEqual(["tests"]);
  expect(parameters.$defs.suggestion.properties.rationale).toMatchObject({
    type: "array",
    items: { type: "string" },
  });
});
