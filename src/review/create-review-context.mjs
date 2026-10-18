import { prepareReviewRequest } from "./request-phase.mjs";

export function createReviewSession({ prompt, combined, model, plainText, webSearch, add }) {
  return {
    request: prepareReviewRequest(prompt, combined, model, plainText, add, webSearch),
    controller: new AbortController(),
  };
}
