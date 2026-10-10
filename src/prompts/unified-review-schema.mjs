export function createUnifiedReviewParameters(categories) {
  return {
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
              description: "List every issue. If none remain, return one no-issues sentinel.",
              items: { $ref: "#/$defs/issue" },
            },
          ]),
        ),
        required: [...categories],
      },
      verdict: {
        type: "string",
        enum: ["pass", "block"],
        description: "Block only for unresolved P0 or P1 issues.",
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
            description: "Use the issue priority. Use none for the no-issues sentinel.",
          },
          locations: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
            description:
              'List each relevant file path and line range. Use ["none"] for a sentinel.',
          },
          issues: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
            description:
              'For P0-P3, state one current defect, its cause, and its effect. Keep all entries about the same defect. Do not include rejected claims or say that no defect exists. For none, use ["No issues found."].',
          },
        },
        required: ["severity", "locations", "issues"],
      },
    },
  };
}
