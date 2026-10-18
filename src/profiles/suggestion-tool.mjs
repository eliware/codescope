import { SUGGESTION_CATEGORIES } from "./categories.mjs";
import { readPrompt } from "./prompt-sources/read-content.mjs";

export function createSuggestionTool(categories = SUGGESTION_CATEGORIES) {
  return {
    type: "function",
    name: "submit_suggestions",
    description: readPrompt("schema-suggestions-tool.md"),
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        suggestions: {
          type: "object",
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: "array", minItems: 1, items: { $ref: "#/$defs/suggestion" } },
            ]),
          ),
          required: [...categories],
        },
      },
      required: ["suggestions"],
      $defs: {
        suggestion: {
          type: "object",
          additionalProperties: false,
          properties: {
            locations: { type: "array", minItems: 1, items: { type: "string" } },
            suggestion: { type: "string" },
            rationale: {
              type: "array",
              items: { type: "string" },
              description: readPrompt("schema-suggestion-rationale.md"),
            },
            ignore_example: {
              type: "string",
              description: readPrompt("schema-suggestion-ignore-example.md"),
            },
          },
          required: ["locations", "suggestion", "rationale", "ignore_example"],
        },
      },
    },
  };
}

export const suggestionTool = createSuggestionTool();
