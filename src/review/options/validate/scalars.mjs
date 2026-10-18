import { validateReviewScalarValues } from "./scalar-values.mjs";
import { validatePromptRequest } from "../validate-prompt/request.mjs";

export function validateReviewScalars(options) {
  validateReviewScalarValues(options);
  validatePromptRequest(options);
}
