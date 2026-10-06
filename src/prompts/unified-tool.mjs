import { REVIEW_CATEGORIES } from "./categories.mjs";
import { createUnifiedReviewParameters } from "./unified-review-schema.mjs";

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_unified_review",
    description:
      "Return the full review. List each proven issue. Use a no-issues sentinel when a category has no issue.",
    strict: true,
    parameters: createUnifiedReviewParameters(categories),
  };
}
