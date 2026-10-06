import { REVIEW_CATEGORIES } from "./categories.mjs";
import { createUnifiedReviewParameters } from "./unified-review-schema.mjs";

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_unified_review",
    description:
      "Return the complete consolidated evidence-based review with all actionable findings and a no-issues sentinel for each empty category.",
    strict: true,
    parameters: createUnifiedReviewParameters(categories),
  };
}
