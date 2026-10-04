import { REVIEW_CATEGORIES } from "./categories.mjs";

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_unified_review",
    description: "Return one consolidated CodeScope review with all actionable findings.",
    strict: true,
    parameters: {
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
                description: "Findings in this category, or its single no-issues sentinel.",
                items: { $ref: "#/$defs/finding" },
              },
            ]),
          ),
          required: [...categories],
        },
        verdict: { type: "string", enum: ["pass", "block"] },
      },
      required: ["findings", "verdict"],
      $defs: {
        finding: {
          type: "object",
          additionalProperties: false,
          properties: {
            severity: { type: "string", enum: ["P0", "P1", "P2", "P3", "none"] },
            location: { type: "string" },
            finding: {
              type: "string",
              description:
                "A concrete issue with a current impact, or the exact no-issues sentinel.",
            },
            recommendation: {
              type: "string",
              description: "A practical change for a real finding; blank for the sentinel.",
            },
            rationale: {
              type: "array",
              items: { type: "string" },
              description:
                "Concise evidence-based reasons ending at the impact; empty for the sentinel.",
            },
            ignore_example: {
              type: "string",
              description: "A complete // codescope ignore: ... comment; blank for the sentinel.",
            },
          },
          required: [
            "severity",
            "location",
            "finding",
            "recommendation",
            "rationale",
            "ignore_example",
          ],
        },
      },
    },
  };
}
