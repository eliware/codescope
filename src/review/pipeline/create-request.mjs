import { createReviewSession } from "../create-review-context.mjs";

export function createRequest(options, combined) {
  return createReviewSession({
    prompt: options.prompt,
    combined,
    model: options.model,
    plainText: options.plainText,
    add: options.add,
  });
}
