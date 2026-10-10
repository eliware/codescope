export function createReviewParameters(categories) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      issues: {
        type: "object",
        description: "All review categories. Use an empty array when a category has no issues.",
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
            enum: ["P0", "P1", "P2", "P3"],
            description: "Highest applicable issue priority.",
          },
          locations: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
            description: "Supplied file paths and relevant line ranges.",
          },
          issues: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
            description: "One concise, independently checkable defect.",
          },
          evidence: {
            type: "string",
            description:
              "Code and related test, specification, or documentation evidence from this request.",
          },
          impact: { type: "string", description: "Concrete effect of the demonstrated defect." },
        },
        required: ["severity", "locations", "issues", "evidence", "impact"],
      },
    },
  };
}
