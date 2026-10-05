import { REVIEW_CATEGORIES } from "./categories.mjs";
import { createReviewParameters } from "./review-schema.mjs";

export function createReviewTool(categories = REVIEW_CATEGORIES) {
  return {
    type: "function",
    name: "submit_review",
    description: "Return the complete evidence-based review and prior-finding assessments.",
    strict: true,
    parameters: createReviewParameters(categories),
  };
}

export const reviewTool = createReviewTool();
