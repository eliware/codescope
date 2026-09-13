import { prepareReviewRequest } from './request-phase.mjs';

export function createReviewSession({ prompt, combined, model, plainText, add }) {
  return {
    request: prepareReviewRequest(prompt, combined, model, plainText, add),
    controller: new AbortController(),
  };
}
