import { REVIEW_CATEGORIES } from "./categories.mjs";
import { readPrompt } from "./prompt-sources/read-content.mjs";

export function createReviewTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_review",
    description: readPrompt("schema-review-tool.md"),
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        issues: {
          type: "object",
          description: readPrompt("schema-review-categories.md"),
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: "array", items: { $ref: "#/$defs/issue" } },
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
              enum: ["P0", "P1", "P2", "P3"],
              description: readPrompt("schema-severity.md"),
            },
            locations: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
              description: readPrompt("schema-locations.md"),
            },
            issues: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
              description: readPrompt("schema-issues.md"),
            },
            evidence: { type: "string", description: readPrompt("schema-evidence.md") },
            impact: { type: "string", description: readPrompt("schema-impact.md") },
          },
          required: ["severity", "locations", "issues", "evidence", "impact"],
        },
      },
    },
  };
}

export const reviewTool = createReviewTool();
