import { REVIEW_CATEGORIES } from "./categories.mjs";
import { createReviewParameters } from "./review-schema.mjs";

export function createReviewTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_review",
    description: "Call this tool to return the full review. Use only evidence from this request.",
    strict: true,
    parameters: createReviewParameters(categories),
  };
}

export const reviewTool = createReviewTool();
