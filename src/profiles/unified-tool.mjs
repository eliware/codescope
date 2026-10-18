import { REVIEW_CATEGORIES } from "./categories.mjs";
import { readPrompt } from "./prompt-sources/read-content.mjs";

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_unified_review",
    description: readPrompt("schema-unified-tool.md"),
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        issues: {
          type: "object",
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              {
                type: "array",
                minItems: 1,
                description: readPrompt("schema-unified-category.md"),
                items: { $ref: "#/$defs/issue" },
              },
            ]),
          ),
          required: [...categories],
        },
        verdict: {
          type: "string",
          enum: ["pass", "stop"],
          description: readPrompt("schema-verdict.md"),
        },
      },
      required: ["issues", "verdict"],
      $defs: {
        issue: {
          type: "object",
          additionalProperties: false,
          properties: {
            severity: {
              type: "string",
              enum: ["P0", "P1", "P2", "P3", "none"],
              description: readPrompt("schema-unified-severity.md"),
            },
            locations: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
              description: readPrompt("schema-unified-locations.md"),
            },
            issues: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
              description: readPrompt("schema-unified-issues.md"),
            },
          },
          required: ["severity", "locations", "issues"],
        },
      },
    },
  };
}
