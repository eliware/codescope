export function createUnifiedReviewParameters(categories) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      findings: {
        type: "object",
        additionalProperties: false,
        properties: Object.fromEntries(
          categories.map((category) => [
            category,
            {
              type: "array",
              minItems: 1,
              description: "List every finding. If none remain, return one no-issues sentinel.",
              items: { $ref: "#/$defs/finding" },
            },
          ]),
        ),
        required: [...categories],
      },
      verdict: {
        type: "string",
        enum: ["pass", "block"],
        description: "Block only for unresolved P0 or P1 findings.",
      },
    },
    required: ["findings", "verdict"],
    $defs: {
      finding: {
        type: "object",
        additionalProperties: false,
        properties: {
          severity: {
            type: "string",
            enum: ["P0", "P1", "P2", "P3", "none"],
            description: "Use the issue priority. Use none for the no-issues sentinel.",
          },
          location: { type: "string" },
          finding: {
            type: "string",
            description:
              "For P0-P3, state one current defect, its cause, and its effect. Do not include claims that you reject or say that no defect exists. For none, use exactly 'No issues found.'.",
          },
        },
        required: ["severity", "location", "finding"],
      },
    },
  };
}
