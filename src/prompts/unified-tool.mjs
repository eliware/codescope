import { REVIEW_CATEGORIES } from "./categories.mjs";
import { createReviewParameters } from "./review-schema.mjs";

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_unified_review",
    description:
      "Return the complete consolidated evidence-based review with all actionable findings.",
    strict: true,
    parameters: createReviewParameters(categories),
  };
}
