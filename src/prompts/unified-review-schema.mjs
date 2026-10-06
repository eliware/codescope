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
              description:
                "Complete list of actionable findings, or exactly one no-issues sentinel.",
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
            description: "Applicable priority, or none for the no-issues sentinel.",
          },
          location: { type: "string" },
          finding: {
            type: "string",
            description:
              "A concrete, evidence-supported issue requiring action, or the exact no-issues sentinel.",
          },
        },
        required: ["severity", "location", "finding"],
      },
    },
  };
}
