export function createReviewParameters(categories) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      findings: {
        type: "object",
        description: "Every review category, with an empty array when it has no findings.",
        additionalProperties: false,
        properties: Object.fromEntries(
          categories.map((category) => [
            category,
            { type: "array", items: { $ref: "#/$defs/finding" } },
          ]),
        ),
        required: [...categories],
      },
      reviewed_prior_findings: {
        type: "array",
        description:
          "One assessment per initial finding ID; use an empty array in the initial review.",
        items: { $ref: "#/$defs/assessment" },
      },
      verdict: {
        type: "string",
        enum: ["pass", "block"],
        description: "Block only for unresolved P0 or P1 findings.",
      },
    },
    required: ["findings", "reviewed_prior_findings", "verdict"],
    $defs: {
      finding: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "Unique finding ID, such as F001." },
          severity: {
            type: "string",
            enum: ["P0", "P1", "P2", "P3"],
            description: "Highest applicable issue priority.",
          },
          location: { type: "string", description: "Supplied file path and relevant line(s)." },
          issue: { type: "string", description: "One concise, independently checkable defect." },
          evidence: {
            type: "string",
            description:
              "Specific supplied code and relevant test, specification, or documentation evidence.",
          },
          impact: { type: "string", description: "Concrete effect of the demonstrated defect." },
        },
        required: ["id", "severity", "location", "issue", "evidence", "impact"],
      },
      assessment: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "The ID of one initial finding." },
          classification: {
            type: "string",
            enum: ["real", "partially_real", "false_positive"],
            description: "Independent assessment of the prior finding.",
          },
          basis: {
            type: "string",
            description: "Brief supplied-evidence basis for the classification and any correction.",
          },
        },
        required: ["id", "classification", "basis"],
      },
    },
  };
}
